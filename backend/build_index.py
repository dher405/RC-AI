import time
from selenium import webdriver
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.chrome.options import Options
from bs4 import BeautifulSoup
import logging
from urllib.parse import urlparse
import os
from threading import Lock
from llama_index.core import VectorStoreIndex
from llama_index.core.node_parser import SimpleNodeParser
from llama_index.core import Document

# Initialize logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Function to get Chrome binary
def get_chrome_binary():
    chrome_binary = os.environ.get("CHROME_BIN", "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome") # change this line
    if not os.path.exists(chrome_binary):
        raise FileNotFoundError("Chrome binary not found! Check installation.")
    return chrome_binary

# Function to get ChromeDriver binary
def get_chromedriver_binary():
    chromedriver_binary = os.environ.get("CHROMEDRIVER_BIN", "/opt/render/chromedriver/chromedriver-linux64/chromedriver")
    if not os.path.exists(chromedriver_binary):
        raise FileNotFoundError("ChromeDriver binary not found! Check installation.")
    return chromedriver_binary

# Driver Pool
driver_pool = []
pool_lock = Lock()
pool_size = 5  # adjust as needed.

def initialize_driver():
    options = Options()
    options.binary_location = get_chrome_binary()
    options.add_argument("--headless=new")
    options.add_argument("--disable-gpu")
    options.add_argument("--remote-debugging-port=9222")
    options.add_argument("--no-sandbox")
    options.add_argument("--disable-dev-shm-usage")
    options.add_argument("--disable-blink-features=AutomationControlled")
    options.add_argument("--disable-infobars")
    options.add_argument(
        "user-agent=Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36"
    )

    service = Service(get_chromedriver_binary())
    try:
        driver = webdriver.Chrome(service=service, options=options)
        return driver
    except Exception as e:
        logger.error(f"Failed to start ChromeDriver: {e}")
        return None

def get_driver_from_pool():
    with pool_lock:
        if driver_pool:
            return driver_pool.pop()
        if len(driver_pool) < pool_size:
            return initialize_driver()
        else:
            return initialize_driver()

def return_driver_to_pool(driver):
    with pool_lock:
        driver_pool.append(driver)

def extract_text_from_website(url):
    driver = get_driver_from_pool()
    extracted_text = ""
    try:
        driver.set_page_load_timeout(300)
        driver.get(url)
        time.sleep(15)

        driver.execute_script("window.scrollTo(0, document.body.scrollHeight);")
        time.sleep(5)

        soup = BeautifulSoup(driver.page_source, "html.parser")
        extracted_text = soup.get_text(separator="\n", strip=True)

        return extracted_text

    except Exception as e:
        logger.error(f"Failed to extract text from {url}: {e}")
        return ""

    finally:
        return_driver_to_pool(driver)

def build_index():
    urls = [
        "https://developers.ringcentral.com/api-reference/Call-Forwarding/listForwardingNumbers",
        "https://developers.ringcentral.com/api-reference/voice/createForwardingNumber",
        "https://developers.ringcentral.com/api-reference/voice/updateAnsweringRule",
        "https://developers.ringcentral.com/api-reference/voice/readAnsweringRules",
    ]

    print("🌐 Crawling...")
    documents = []
    for url in urls:
        page_source = extract_text_from_website(url)
        if page_source:
            documents.append(Document(text=page_source, metadata={"url": url}))

    parser = SimpleNodeParser()
    nodes = parser.get_nodes_from_documents(documents)

    index = VectorStoreIndex(nodes)
    index.storage_context.persist(persist_dir="./storage")

    print("✅ Index built and saved!")

if __name__ == "__main__":
    build_index()
