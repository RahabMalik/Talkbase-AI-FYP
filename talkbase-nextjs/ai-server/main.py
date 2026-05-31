"""
TalkBase AI Server
==================
FastAPI server that powers the AI chatbot for TalkBase.
Runs on localhost:8001 (backend Node.js is on 8000).

Endpoints:
  GET  /health       — health check
  POST /ingest       — receive text from backend, embed, store in Pinecone
  POST /chat         — receive question, search Pinecone, answer via GPT
  POST /delete       — delete all vectors for a businessId (on FAQ delete)
"""

import os
import re
import uuid
import logging
from typing import Optional

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from dotenv import load_dotenv

from openai import OpenAI
from pinecone import Pinecone, ServerlessSpec

# ── Setup ─────────────────────────────────────────────────────────────────────
load_dotenv()
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("talkbase-ai")

app = FastAPI(title="TalkBase AI Server", version="1.0.0")

# Allow Next.js frontend + Node.js backend to call us freely
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:8000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Clients ───────────────────────────────────────────────────────────────────
OPENAI_API_KEY  = os.getenv("OPENAI_API_KEY")
PINECONE_API_KEY = os.getenv("PINECONE_API_KEY")
PINECONE_INDEX  = os.getenv("PINECONE_INDEX", "talkbase")

if not OPENAI_API_KEY:
    raise RuntimeError("OPENAI_API_KEY is missing from .env")
if not PINECONE_API_KEY:
    raise RuntimeError("PINECONE_API_KEY is missing from .env")

openai_client = OpenAI(api_key=OPENAI_API_KEY)

pc = Pinecone(api_key=PINECONE_API_KEY)

# Create index if it doesn't exist yet (text-embedding-3-small → 1536 dims)
existing_indexes = [idx.name for idx in pc.list_indexes()]
if PINECONE_INDEX not in existing_indexes:
    logger.info(f"Creating Pinecone index '{PINECONE_INDEX}' ...")
    pc.create_index(
        name=PINECONE_INDEX,
        dimension=1536,
        metric="cosine",
        spec=ServerlessSpec(cloud="aws", region="us-east-1"),
    )
    logger.info("Index created.")

index = pc.Index(PINECONE_INDEX)

EMBEDDING_MODEL = "text-embedding-3-small"
GPT_MODEL       = "gpt-3.5-turbo"
CONFIDENCE_THRESHOLD = 0.50


# ── Pydantic Schemas ──────────────────────────────────────────────────────────
class IngestRequest(BaseModel):
    text: str
    businessId: str
    source: Optional[str] = "manual"   # "manual" | "file" | "faq"
    faqId: Optional[str] = None        # set when ingesting a specific FAQ

class ChatRequest(BaseModel):
    question: str
    businessId: str

class DeleteRequest(BaseModel):
    businessId: str
class DeleteFaqRequest(BaseModel):
    faqId: str
    businessId: str




# ── Helpers ───────────────────────────────────────────────────────────────────
def clean_text(raw: str) -> str:
    """Remove extra whitespace, normalize line breaks."""
    text = raw.replace("\r\n", "\n").replace("\r", "\n")
    # Collapse multiple blank lines to one
    text = re.sub(r"\n{3,}", "\n\n", text)
    # Collapse multiple spaces
    text = re.sub(r"[ \t]{2,}", " ", text)
    # Strip leading/trailing whitespace per line
    lines = [line.strip() for line in text.splitlines()]
    text = "\n".join(lines).strip()
    return text


def chunk_text(text: str, max_words: int = 350, overlap: int = 50) -> list[str]:
    """
    Split text into chunks of ~350 words with 50-word overlap so context
    is never completely cut off at chunk boundaries.
    """
    words = text.split()
    chunks = []
    start = 0
    while start < len(words):
        end = start + max_words
        chunk = " ".join(words[start:end])
        if chunk.strip():
            chunks.append(chunk.strip())
        start = end - overlap  # overlap to preserve context
    return chunks


def get_embedding(text: str) -> list[float]:
    """Call OpenAI embedding API and return the vector."""
    response = openai_client.embeddings.create(
        model=EMBEDDING_MODEL,
        input=text,
    )
    return response.data[0].embedding


# ── Routes ────────────────────────────────────────────────────────────────────
@app.get("/health")
def health():
    return {"status": "ok", "service": "TalkBase AI Server"}


@app.post("/ingest")
async def ingest(req: IngestRequest):
    """
    Receive raw text + businessId from the Node.js backend.
    Clean → chunk → embed → store in Pinecone.
    """
    try:
        if not req.text or not req.text.strip():
            raise HTTPException(status_code=400, detail="text is required and cannot be empty")
        if not req.businessId or not req.businessId.strip():
            raise HTTPException(status_code=400, detail="businessId is required")

        logger.info(f"[INGEST] businessId={req.businessId}, chars={len(req.text)}")

        # Step 1: Clean
        cleaned = clean_text(req.text)
        logger.info(f"[INGEST] After cleaning: {len(cleaned)} chars")

        # Step 2: Chunk
        chunks = chunk_text(cleaned)
        logger.info(f"[INGEST] Chunks created: {len(chunks)}")

        if not chunks:
            return {"success": False, "error": "No valid content to ingest after cleaning"}

        # Step 3 + 4: Embed each chunk and upsert into Pinecone
        vectors = []
        for i, chunk in enumerate(chunks):
            embedding = get_embedding(chunk)
            vector_id = f"{req.businessId}_{uuid.uuid4().hex}"
            vectors.append({
                "id": vector_id,
                "values": embedding,
                "metadata": {
                    "text": chunk,
                    "businessId": str(req.businessId),
                    "source": req.source,
                    "chunkIndex": i,
                    **({"faqId": str(req.faqId)} if req.faqId else {}),
                },
            })

        # Upsert in batches of 100 (Pinecone limit)
        batch_size = 100
        for i in range(0, len(vectors), batch_size):
            index.upsert(vectors=vectors[i : i + batch_size])

        logger.info(f"[INGEST] Stored {len(vectors)} vectors for businessId={req.businessId}")
        return {
            "success": True,
            "chunksStored": len(vectors),
            "businessId": req.businessId,
        }

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"[INGEST ERROR] {e}", exc_info=True)
        return {"success": False, "error": f"Ingestion failed: {str(e)}"}


@app.post("/chat")
async def chat(req: ChatRequest):
    """
    Receive a customer question + businessId.
    Embed question → search Pinecone (filtered by businessId) → GPT answer.
    """
    try:
        if not req.question or not req.question.strip():
            raise HTTPException(status_code=400, detail="question is required")
        if not req.businessId or not req.businessId.strip():
            raise HTTPException(status_code=400, detail="businessId is required")

        logger.info(f"[CHAT] businessId={req.businessId}, question={req.question[:80]}")

        question_lower = req.question.strip().lower().rstrip("!.,? ")
        general = {"hi","hello","hey","ok","okay","thanks","thank you","how are you","how are you doing","who are you","what can you do","are you a bot","great","nice","cool","got it","sure","perfect","alright"}
        if question_lower in general:
            return {"success":True,"answer":"Hello! I am here to help. Feel free to ask me anything about our products, services, or return policy.","confidence":1.0,"resolved":True}

        # ── Handle greetings and general questions BEFORE hitting Pinecone ──
        question_lower = req.question.strip().lower().rstrip("!.,? ")

        greetings = {"hi", "hello", "hey", "hiya", "howdy", "sup", "yo",
                     "good morning", "good afternoon", "good evening", "greetings",
                     "hi there", "hello there"}
        if question_lower in greetings:
            return {
                "success": True,
                "answer": "Hello! I am here to help. Feel free to ask me anything about our products, services, return policy, shipping, or any other questions you have.",
                "confidence": 1.0,
                "resolved": True,
            }

        general_questions = {
            "how are you", "how are you doing", "who are you", "what are you",
            "what can you do", "what do you do", "are you a bot", "are you human",
            "are you an ai", "ok", "okay", "thanks", "thank you", "thank you so much",
            "great", "nice", "cool", "awesome", "got it", "understood", "sure",
            "sounds good", "perfect", "alright", "ok thanks", "okay thanks",
        }
        if question_lower in general_questions:
            return {
                "success": True,
                "answer": "I am glad I could help! Feel free to ask me any other questions about our business.",
                "confidence": 1.0,
                "resolved": True,
            }

        # Step 1: Embed the question
        question_embedding = get_embedding(req.question)

        # Step 2: Search Pinecone filtered by businessId (data isolation)
        results = index.query(
            vector=question_embedding,
            top_k=3,
            filter={"businessId": {"$eq": str(req.businessId)}},
            include_metadata=True,
        )

        matches = results.get("matches", [])
        logger.info(f"[CHAT] Pinecone returned {len(matches)} matches")

        # Step 3: Check confidence of top match
        if not matches:
            return {
                "success": True,
                "answer": "I am not fully sure about this. Please contact our support team directly.",
                "confidence": 0.0,
                "resolved": False,
            }

        top_score = matches[0]["score"]
        logger.info(f"[CHAT] Top similarity score: {top_score:.4f}")

        # Step 4: Low confidence fallback
        if top_score < CONFIDENCE_THRESHOLD:
            return {
                "success": True,
                "answer": "I am not fully sure about this. Please contact our support team directly.",
                "confidence": round(top_score, 4),
                "resolved": False,
            }

        # Step 5: Build context from top chunks
        context_chunks = [m["metadata"]["text"] for m in matches if m.get("metadata", {}).get("text")]
        context = "\n\n---\n\n".join(context_chunks)

        # Step 6: Ask GPT
        system_prompt = (
            "You are a helpful and friendly customer support assistant. "
            "Your job is to answer customer questions based on the context provided. "
            "Rules:\n"
            "1. For greetings (hi, hello, hey etc.) — respond warmly and invite the customer to ask their question.\n"
            "2. For general questions like 'how are you', 'what can you do', 'who are you' — answer naturally and briefly, then offer to help.\n"
            "3. For business-specific questions — answer using ONLY the context below.\n"
            "4. If the answer is not in the context — say: 'I am not fully sure about this. Please contact our support team directly.'\n"
            "Keep answers concise, clear, and professional. Do not make up information."
        )

        user_prompt = f"""Context:
{context}

Customer Question: {req.question}

Answer:"""

        gpt_response = openai_client.chat.completions.create(
            model=GPT_MODEL,
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_prompt},
            ],
            temperature=0.3,
            max_tokens=400,
        )

        answer = gpt_response.choices[0].message.content.strip()
        logger.info(f"[CHAT] GPT answered ({len(answer)} chars)")

        return {
            "success": True,
            "answer": answer,
            "confidence": round(top_score, 4),
            "resolved": True,
        }

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"[CHAT ERROR] {e}", exc_info=True)
        return {"success": False, "error": f"Chat failed: {str(e)}"}


@app.post("/delete")
async def delete_business_vectors(req: DeleteRequest):
    """
    Delete ALL Pinecone vectors for a given businessId.
    Call this when a business deletes all their FAQs or account.
    """
    try:
        if not req.businessId or not req.businessId.strip():
            raise HTTPException(status_code=400, detail="businessId is required")

        logger.info(f"[DELETE] Deleting vectors for businessId={req.businessId}")

        # Pinecone supports delete by metadata filter
        index.delete(filter={"businessId": {"$eq": str(req.businessId)}})

        logger.info(f"[DELETE] Done for businessId={req.businessId}")
        return {"success": True, "message": f"Vectors deleted for businessId={req.businessId}"}

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"[DELETE ERROR] {e}", exc_info=True)
        return {"success": False, "error": "AI service error during deletion"}


@app.post("/delete-faq")
async def delete_faq_vectors(req: DeleteFaqRequest):
    """
    Delete Pinecone vectors for a single FAQ (by faqId metadata filter).
    Called when a business owner deletes one FAQ from the dashboard.
    """
    try:
        if not req.faqId or not req.businessId:
            raise HTTPException(status_code=400, detail="faqId and businessId are required")

        logger.info(f"[DELETE-FAQ] faqId={req.faqId}, businessId={req.businessId}")

        index.delete(filter={
            "businessId": {"$eq": str(req.businessId)},
            "faqId":      {"$eq": str(req.faqId)},
        })

        logger.info(f"[DELETE-FAQ] Done for faqId={req.faqId}")
        return {"success": True, "message": f"Vectors deleted for faqId={req.faqId}"}

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"[DELETE-FAQ ERROR] {e}", exc_info=True)
        return {"success": False, "error": "AI service error during FAQ vector deletion"}
