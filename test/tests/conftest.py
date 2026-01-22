import pytest
from selenium import webdriver
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.chrome.options import Options
import subprocess
import os
from pathlib import Path
# from selenium.webdriver.support.ui import WebDriverWait
# from selenium.webdriver.support import expected_conditions as EC
# from selenium.webdriver.support.ui import Select
# from selenium.webdriver.common.by import By

# from selenium.webdriver.common.desired_capabilities import DesiredCapabilities

BASE_URL = "http://localhost:3000"

@pytest.fixture
def driver():
    options = Options()
    options.binary_location = "/usr/bin/chromium"
    options.add_argument("--remote-debugging-port=9222")  # Required for pychrome
    options.add_argument("--headless")  # Uncomment to run headlessly
    options.add_argument("--no-sandbox")
    options.add_argument("--disable-dev-shm-usage")
    options.set_capability('goog:loggingPrefs', {'browser': 'ALL'})
    service = Service("/usr/bin/chromedriver")
    driver = webdriver.Chrome(service=service, options=options)
    yield driver
    driver.quit()

@pytest.fixture(scope="session", autouse=True)
def reset_test_db():
    # Only runs once per pytest session
    print("♻️ Resetting test DB via Node migration script...")
    env = os.environ.copy()
    env["NODE_ENV"] = "development"
    current = Path(__file__).resolve()
    project_root = next(p for p in current.parents if (p / "backend").exists())
    migrate_script = project_root / "backend" / "database" / "migrate.js"
    result = subprocess.run(["node", str(migrate_script)], check=True, env=env, capture_output=True)
    print("STDOUT:", result.stdout)
    print("STDERR:", result.stderr)
    if result.returncode != 0:
        raise RuntimeError("❌ DB migration failed")
    yield
    print("✅ Test session finished")
