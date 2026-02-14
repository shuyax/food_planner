import pytest
from selenium import webdriver
from selenium.webdriver.common.by import By
# from selenium.webdriver.chrome.service import Service
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.support.ui import Select, WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from datetime import date, timedelta
from conftest import BASE_URL
import math

def test_home_with_related_fields(driver):
    driver.get(BASE_URL)
    prev_btn = WebDriverWait(driver, 10).until(
        EC.element_to_be_clickable((By.XPATH, "//button[@title='Previous week']"))
    )
    assert prev_btn.is_displayed(), "Previous button is not visible"
    next_btn = WebDriverWait(driver, 10).until(
        EC.element_to_be_clickable((By.XPATH, "//button[@title='Next week']"))
    )
    assert next_btn.is_displayed(), "Next button is not visible"
    today_btn = WebDriverWait(driver, 10).until(
        EC.presence_of_element_located((By.XPATH, "//button[@title='This week']"))
    )
    assert today_btn.is_displayed(), "Today button is not visible"
    assert today_btn.get_attribute("disabled") == 'true', "Today button should be disabled when the calendar view includes today"
    today = date.today().isoformat()
    today_cell = WebDriverWait(driver, 10).until(
        EC.presence_of_element_located((By.XPATH, f"//th[@data-date='{today}']"))
    )
    assert today_cell.is_displayed(), "Today cell should be visible"
    month_btn = WebDriverWait(driver, 10).until(
        EC.element_to_be_clickable((By.XPATH, "//button[@title='month view']"))
    )
    assert month_btn.is_displayed(), "Month button is not visible"
    week_btn = WebDriverWait(driver, 10).until(
        EC.element_to_be_clickable((By.XPATH, "//button[@title='week view']"))
    )
    assert week_btn.is_displayed(), "Week button is not visible"
    assert week_btn.get_attribute("aria-pressed") == "true", "Week button should be selected by default"
    day_btn = WebDriverWait(driver, 10).until(
        EC.element_to_be_clickable((By.XPATH, "//button[@title='day view']"))
    )
    assert day_btn.is_displayed(), "Day button is not visible"
    tr_elements = driver.find_elements(By.XPATH, "//*[@id='root']/div/div/div[2]/div/table/thead/tr/th/div/div/table/thead/tr")
    assert len(tr_elements) == 1, "There should be only one table head"
    th_elements = tr_elements[0].find_elements(By.TAG_NAME, "th")
    assert len(th_elements) == 7, "There should be 7 days listed"
    add_meal_btns = driver.find_elements(By.CLASS_NAME, "add-meal-btn")
    assert len(th_elements) == 7, "There should be 7 add-meal-btn displayed"


def test_prev_btn(driver):
    driver.get(BASE_URL)
    prev_btn = WebDriverWait(driver, 10).until(
        EC.element_to_be_clickable((By.XPATH, "//button[@title='Previous week']"))
    )
    prev_btn.click()
    today = date.today()
    seven_days_ago = (today - timedelta(days=7)).isoformat()
    seven_days_ago_cell = WebDriverWait(driver, 10).until(
        EC.presence_of_element_located((By.XPATH, f"//th[@data-date='{seven_days_ago}']"))
    )
    assert seven_days_ago_cell.is_displayed(), "Seven_days_ago cell should be visible"

def test_next_btn(driver):
    driver.get(BASE_URL)
    next_btn = WebDriverWait(driver, 10).until(
        EC.element_to_be_clickable((By.XPATH, "//button[@title='Next week']"))
    )
    next_btn.click()
    today = date.today()
    seven_days_later = (today + timedelta(days=7)).isoformat()
    seven_days_later_cell = WebDriverWait(driver, 10).until(
        EC.presence_of_element_located((By.XPATH, f"//th[@data-date='{seven_days_later}']"))
    )
    assert seven_days_later_cell.is_displayed(), "seven_days_later cell should be visible"

def test_month_btn(driver):
    driver.get(BASE_URL)
    month_btn = WebDriverWait(driver, 10).until(
        EC.element_to_be_clickable((By.XPATH, "//button[@title='month view']"))
    )
    month_btn.click()
    tbody_elements = driver.find_elements(By.XPATH, "//*[@id='root']/div/div/div[2]/div/table/tbody/tr/td/div/div/div/table/tbody")
    td_elements = tbody_elements[0].find_elements(By.TAG_NAME, "td")
    assert len(td_elements) >= 28, "There should be more than 28 days in a month view"

def test_day_btn(driver):
    driver.get(BASE_URL)
    day_btn = WebDriverWait(driver, 10).until(
        EC.element_to_be_clickable((By.XPATH, "//button[@title='day view']"))
    )
    day_btn.click()
    tbody_elements = driver.find_elements(By.XPATH, "//*[@id='root']/div/div/div[2]/div/table/tbody/tr/td/div/div/div/table/tbody")
    td_elements = tbody_elements[0].find_elements(By.TAG_NAME, "td")
    assert len(td_elements) == 1, "There should only one day in a day view"

def test_week_btn(driver):
    driver.get(BASE_URL)
    day_btn = WebDriverWait(driver, 10).until(
        EC.element_to_be_clickable((By.XPATH, "//button[@title='day view']"))
    )
    day_btn.click()
    tbody_elements = driver.find_elements(By.XPATH, "//*[@id='root']/div/div/div[2]/div/table/tbody/tr/td/div/div/div/table/tbody")
    td_elements = tbody_elements[0].find_elements(By.TAG_NAME, "td")
    assert len(td_elements) == 1, "There should only one day in a day view"
    week_btn = WebDriverWait(driver, 10).until(
        EC.element_to_be_clickable((By.XPATH, "//button[@title='week view']"))
    )
    week_btn.click()
    tbody_elements = driver.find_elements(By.XPATH, "//*[@id='root']/div/div/div[2]/div/table/tbody/tr/td/div/div/div/table/tbody")
    td_elements = tbody_elements[0].find_elements(By.TAG_NAME, "td")
    assert len(td_elements) == 7, "There should 7 days in a week view"

def test_navigate_to_a_day_meals(driver):
    driver.get(BASE_URL)
    today = date.today().isoformat()
    navigate_btn = driver.find_element(
        By.XPATH, f"//td[contains(@class,'fc-daygrid-day') and @data-date='{today}']"
    )
    navigate_btn.click()
    WebDriverWait(driver, 10).until(
        EC.url_contains("/day-meals")
    )
    assert "/day-meals?date=" in driver.current_url

def test_meal_type_loaded_in_month_view(driver):
    target_date = date(2026, 1, 5)
    # current visible month (FullCalendar usually shows first day of current month)
    current_month_first_day = date.today().replace(day=1)
    # calculate difference in months
    month_diff = (current_month_first_day.year - target_date.year) * 12 + (current_month_first_day.month - target_date.month)
    driver.get(BASE_URL)
    month_btn = WebDriverWait(driver, 10).until(
        EC.element_to_be_clickable((By.XPATH, "//button[@title='month view']"))
    )
    month_btn.click()
    if month_diff > 0:
        btn = driver.find_element(By.CLASS_NAME, "fc-prev-button")
        for _ in range(month_diff):
            btn.click()
    elif month_diff < 0:
        btn = driver.find_element(By.CLASS_NAME, "fc-next-button")
        for _ in range(abs(month_diff)):
            btn.click()
    target_date_str = target_date.strftime("%B %-d, %Y")
    target_date_cell = WebDriverWait(driver, 10).until(
        EC.presence_of_element_located((By.XPATH, f"//a[@aria-label='{target_date_str}']"))
    )
    assert target_date_cell.is_displayed(), "target_date_cell should be visible"
    # Get all events under this cell
    events = target_date_cell.find_elements(By.XPATH, "..//following-sibling::div[contains(@class,'fc-daygrid-day-events')]//a[contains(@class,'fc-event')]")
    expected_meals = ["BREAKFAST", "LUNCH", "DINNER", "SNACK", "DRINK"]
    assert len(events) == len(expected_meals), "All expected meals should have an event"
    # Collect meal titles and colors
    meal_titles = []
    colors = set()
    for e in events:
        event_main_element = e.find_element(By.CLASS_NAME, "fc-event-main")
        children = event_main_element.find_elements(By.XPATH, "./*")
        assert len(children) == 1, "fc-event-main should contain only meal type"
        strong = children[0]
        assert strong.tag_name == "strong", "Only child should be <strong>"
        title = strong.text.strip().upper()
        color = e.value_of_css_property("background-color")
        meal_titles.append(title)
        colors.add(color)
    # Check all expected meals are present
    for meal in expected_meals:
        assert meal in meal_titles, f"{meal} should be present on {target_date_str}"
    # Check that each meal has a different color
    assert len(colors) == len(expected_meals), "All meal types should have different colors"    

def test_meal_type_and_foodname_loaded_in_week_view(driver):
    target_date = date(2026, 1, 5)
    expected_meals = {
        "BREAKFAST": "overnight oats",
        "LUNCH": "spicy sour noodle",
        "DINNER": "tomato beef udon with cheese",
        "SNACK": "beef jerky",
        "DRINK": "taro milk tea"
    }
    driver.get(BASE_URL)
    week_btn = WebDriverWait(driver, 10).until(
        EC.element_to_be_clickable((By.XPATH, "//button[@title='week view']"))
    )
    week_btn.click()
    # Get first day of currently displayed week
    # FullCalendar usually renders the first day in a th[data-date] or td[data-date]
    first_day_cell = WebDriverWait(driver, 10).until(
        EC.presence_of_element_located((By.XPATH, "//td[@data-date] | //th[@data-date]"))
    )
    current_week_start = date.fromisoformat(first_day_cell.get_attribute("data-date"))
    # Calculate difference in weeks
    delta_days = (current_week_start - target_date).days
    week_diff = math.ceil(abs(delta_days) / 7)
    # Navigate to the target week
    if week_diff > 0:
        prev_btn = driver.find_element(By.CLASS_NAME, "fc-prev-button")
        for i in range(abs(week_diff)):
            prev_btn.click()

    elif week_diff < 0:
        next_btn = driver.find_element(By.CLASS_NAME, "fc-next-button")
        for _ in range(abs(week_diff)):
            next_btn.click()

    target_date_str = target_date.isoformat()
    day_cell = WebDriverWait(driver, 10).until(
        EC.presence_of_element_located(
            (By.XPATH, f"//td[@data-date='{target_date_str}']")
        )
    )
    assert day_cell.is_displayed(), "day_cell should be visible"
    WebDriverWait(driver, 10).until(
        EC.presence_of_element_located(
            (By.XPATH, "//*[contains(@id, 'meal-food')]")
        )
    )
    # Get all events inside this frame
    events = day_cell.find_elements(By.XPATH, ".//div[contains(@class,'fc-daygrid-day-events')]//a[contains(@class,'fc-event')]")
    assert len(events) == 5, "There should be 5 meal types on the target day"
    meal_titles = []
    meal_foods = []
    colors = set()

    for e in events:
        meal_cell = e.find_element(By.CLASS_NAME, "fc-event-main")
        # Get food name if it exists
        try:
            title = meal_cell.find_element(By.TAG_NAME, "strong").text.strip().upper()
            meal_titles.append(title)
            food_name = meal_cell.find_element(By.XPATH, ".//li").text.strip()
            meal_foods.append((title, food_name))
        except:
            meal_foods.append((title, None))
        # Collect colors
        colors.add(e.value_of_css_property("background-color"))

    # Check all expected meals are present
    for meal in expected_meals.keys():
        assert meal in meal_titles, f"{meal} should be present on {target_date_str}"

    # Check each meal type has different color
    assert len(colors) == len(expected_meals), "All meal types should have different colors"

    # Check food names match expected
    for title, food_name in meal_foods:
        expected_food = expected_meals.get(title)
        assert food_name == expected_food, f"{title} should have food '{expected_food}', got '{food_name}'"

