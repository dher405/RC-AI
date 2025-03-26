# query_index.py

from dotenv import load_dotenv
load_dotenv()

from llama_index.core import VectorStoreIndex, StorageContext, load_index_from_storage
from llama_index.llms.openai import OpenAI
from llama_index.embeddings.openai import OpenAIEmbedding
from llama_index.core import Settings

# Set up global settings
Settings.llm = OpenAI(model="gpt-4")
Settings.embed_model = OpenAIEmbedding(model="text-embedding-3-small")

# Load the index from disk
storage_context = StorageContext.from_defaults(persist_dir="./storage")
index = load_index_from_storage(storage_context)

# Create a query engine
query_engine = index.as_query_engine(similarity_top_k=3)

# Ask a question
response = query_engine.query("What API call do I use to forward calls to +13035551234?")
print("🧠 Response:\n", response)
