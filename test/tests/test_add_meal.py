import pytest
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.support.ui import Select, WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from conftest import BASE_URL
from datetime import date
import time

target_date = '2026-01-06'
delete_target_date = '2026-01-07'
add_target_date = '2026-01-08'
add_meal_url = f'{BASE_URL}/add-meal?date={target_date}'
delete_add_meal_url = f'{BASE_URL}/add-meal?date={delete_target_date}'
add_add_meal_url = f'{BASE_URL}/add-meal?date={add_target_date}'

def test_add_meal_with_related_fields(driver):
    driver.get(add_meal_url)
    # test the calendar section displayed correctly with related data
    meal_form_element = WebDriverWait(driver, 10).until(
        EC.presence_of_element_located((By.CLASS_NAME, 'meal-form'))
    )
    first_child = meal_form_element.find_element(By.XPATH, "./*[1]")
    assert first_child.get_attribute("class") == "fc fc-media-screen fc-direction-ltr fc-theme-standard", "The first element in a meal-form should be the calendar"
    event_main_btn_element = first_child.find_elements(By.CLASS_NAME, "fc-event-main-btn")
    assert len(event_main_btn_element) == 1, "There should be only one meal displayed on the target day"
    children = event_main_btn_element[0].find_elements(By.XPATH, "./*")
    assert len(children) == 2, "There should be two children under the event"
    assert children[0].tag_name == "strong", "The first child should be <strong>"
    assert children[0].text == "DINNER", "The first child should be DINNER"
    assert children[1].text == "stir fry bok choy", "The second child should be food name"
    # test meal type select element exists and populated correctly
    meal_type_element = WebDriverWait(driver, 10).until(
        EC.presence_of_element_located((By.ID, 'meal-type'))
    )
    assert meal_type_element.is_displayed(), "Meal type select should be visible"
    option_elements = meal_type_element.find_elements(By.TAG_NAME, "option")
    assert len(option_elements) == 6, "There should be 5 meal types and and empty option populated under select"
    assert meal_type_element.find_element(By.XPATH, "./*[1]").text == '-- Select a meal type --', "The first option should be a default option"
    assert meal_type_element.find_element(By.XPATH, "./*[1]").get_attribute('value') == '', "The first option should have an empty value"
    assert meal_type_element.get_attribute('value') == '', "The select element should have an empty value by default"
    
def test_update_food_to_existing_meal(driver):
    driver.get(add_meal_url)
    dinner_event_div = WebDriverWait(driver, 10).until(
        EC.presence_of_element_located(
            (By.XPATH, "//div[contains(@class,'fc-event-main-btn')][.//strong[text()='DINNER']]")
        )
    )
    assert dinner_event_div.is_displayed(), "Dinner section should be visible on the target day"
    meal_food_li_element = dinner_event_div.find_element(By.XPATH, "//li")
    assert meal_food_li_element.text == "stir fry bok choy"
    dinner_event_div.click()
    modal_element = WebDriverWait(driver, 10).until(
        EC.presence_of_element_located((By.CLASS_NAME, 'modal'))
    )
    modal_title = modal_element.find_element(By.ID, "modal-title")
    assert modal_title.text.lower() == 'dinner'
    food_select_element = modal_element.find_element(By.XPATH, ".//select[option[@value='stir fry bok choy']]")
    assert food_select_element.is_displayed(), "The stir fry bok choy should be visible in the modal"
    select = Select(food_select_element)
    select.select_by_visible_text("spicy sour noodle")
    done_btn = modal_element.find_element(By.ID, "foods-save")
    done_btn.click()
    WebDriverWait(driver, 10).until(EC.invisibility_of_element_located((By.CLASS_NAME, 'modal')))
    WebDriverWait(driver, 10).until(
        EC.presence_of_element_located((By.XPATH, "//li"))
    )
    meal_food_li_element = dinner_event_div.find_element(By.XPATH, "//li")
    assert meal_food_li_element.text == "spicy sour noodle", "The updated food should be displayed on the calendar"



def test_add_food_section(driver):
    driver.get(add_add_meal_url)
    meal_type_list = WebDriverWait(driver, 10).until(
        EC.presence_of_element_located((By.ID, 'meal-type'))
    )
    add_meal_btn = WebDriverWait(driver, 10).until(
        EC.presence_of_element_located((By.ID, 'add-meal'))
    )
    select = Select(meal_type_list)
    select.select_by_visible_text("dinner")
    add_meal_btn.click()
    # Open Modal
    dinner_event_div = WebDriverWait(driver, 10).until(
        EC.presence_of_element_located(
            (By.XPATH, "//div[contains(@class,'fc-event-main-btn')][.//strong[text()='DINNER']]")
        )
    )
    dinner_event_div.click()
    modal_element = WebDriverWait(driver, 10).until(
        EC.presence_of_element_located((By.CLASS_NAME, 'modal'))
    )
    # test add food button
    add_food_btn = WebDriverWait(driver, 10).until(
        EC.presence_of_element_located((By.ID, 'add-food'))
    )
    active_meal_foods_section = modal_element.find_element(By.ID, "active-meal-foods")
    children_len_before = len(active_meal_foods_section.find_elements(By.TAG_NAME, "li"))
    add_food_btn.click()
    children_len_after = len(active_meal_foods_section.find_elements(By.TAG_NAME, "li"))
    assert children_len_after == children_len_before + 1, "The number of food listed should be increased by one after clicking add food button"
    new_food_select = active_meal_foods_section.find_element(By.ID, f'{add_target_date}T05:00:00.000Z-dinner--1')
    select = Select(new_food_select)
    select.select_by_visible_text("tomato beef udon with cheese")
    done_btn = modal_element.find_element(By.ID, "foods-save")
    done_btn.click()
    WebDriverWait(driver, 10).until(EC.invisibility_of_element_located((By.CLASS_NAME, 'modal')))
    meal_food_section = dinner_event_div.find_element(By.CLASS_NAME, "meal-food")
    WebDriverWait(driver, 10).until(
        EC.presence_of_element_located((By.XPATH, "//li"))
    )
    meal_food_li_elements = meal_food_section.find_elements(By.XPATH, "//li")
    assert len(meal_food_li_elements) == children_len_after, "The number of foods on calendar should be the number of foods on modal"
    assert meal_food_li_elements[children_len_after-1].text == "tomato beef udon with cheese", "The updated food should be displayed on the calendar"


def test_delete_food_section(driver):
    driver.get(add_meal_url)
    # Open Modal
    dinner_event_div = WebDriverWait(driver, 10).until(
        EC.presence_of_element_located(
            (By.XPATH, "//div[contains(@class,'fc-event-main-btn')][.//strong[text()='DINNER']]")
        )
    )
    dinner_event_div.click()
    modal_element = WebDriverWait(driver, 10).until(
        EC.presence_of_element_located((By.CLASS_NAME, 'modal'))
    )
    # test delete food button
    active_meal_foods_section = modal_element.find_element(By.ID, "active-meal-foods")
    delete_food_btns = active_meal_foods_section.find_elements(By.XPATH, "//button[@class='remove-food-btn']")
    children_len_before = len(active_meal_foods_section.find_elements(By.TAG_NAME, "li"))
    assert len(delete_food_btns) == children_len_before, "Each food should have a delete button before deleting"
    delete_food_btn = delete_food_btns[0]
    delete_food_id = delete_food_btn.id.replace("remove-","")
    delete_food_btn.click()
    delete_food_btns = active_meal_foods_section.find_elements(By.XPATH, "//button[@class='remove-food-btn']")
    children_len_after = len(active_meal_foods_section.find_elements(By.TAG_NAME, "li"))
    assert len(delete_food_btns) == children_len_after, "Each food should have a delete button after deleting"
    assert children_len_after == children_len_before - 1, "The number of food listed should be decrease by one after clicking delete button"
    deleted = WebDriverWait(driver, 10).until(
        EC.invisibility_of_element_located((By.ID, delete_food_id))
    )
    assert deleted is True, "The food deleted should not be visible on the calendar"


def test_add_meal_button(driver):
    driver.get(add_meal_url)
    meal_type_list = WebDriverWait(driver, 10).until(
        EC.presence_of_element_located((By.ID, 'meal-type'))
    )
    add_meal_btn = WebDriverWait(driver, 10).until(
        EC.presence_of_element_located((By.ID, 'add-meal'))
    )
    assert add_meal_btn.get_attribute("disabled") == 'true', "The add meal button should be disabled if the select value is empty"
    meal_section_elements = driver.find_elements(By.CLASS_NAME, 'fc-daygrid-event-harness')
    len_before_add = len(meal_section_elements)
    assert len_before_add == 1, "There should be only one meal type on the target day"
    select = Select(meal_type_list)
    select.select_by_visible_text("dinner")
    assert add_meal_btn.get_attribute("disabled") == None, "The add meal button should be enabled if the select value is not empty"
    add_meal_btn.click()
    # Wait for the DOM to update (length should stay the same for duplicate)
    WebDriverWait(driver, 10).until(
        lambda d: len(d.find_elements(By.CLASS_NAME, 'fc-daygrid-event-harness')) == len_before_add
    )
    meal_section_elements_v_1 = driver.find_elements(By.CLASS_NAME, 'fc-daygrid-event-harness')
    assert len(meal_section_elements_v_1) == len_before_add, "The meal type section should not increase for a duplicate"
    # Add a new meal (breakfast)
    select.select_by_visible_text("breakfast")
    add_meal_btn.click()
    # Wait until the new meal section appears (length increases)
    WebDriverWait(driver, 10).until(
        lambda d: len(d.find_elements(By.CLASS_NAME, 'fc-daygrid-event-harness')) == len_before_add + 1
    )
    meal_section_elements_v_2 = driver.find_elements(By.CLASS_NAME, 'fc-daygrid-event-harness')
    assert len(meal_section_elements_v_2) == len_before_add + 1, "The meal type section should increase by one for a new meal type"
    # Verify the new meal type text
    new_meal_type_text = meal_section_elements_v_2[1].find_element(
        By.XPATH, "descendant::div[contains(@class,'fc-event-main-btn')]//strong"
    )
    assert new_meal_type_text.text.lower() == 'breakfast'


def test_empty_meal(driver):
    driver.get(add_meal_url)
    meal_type_list = WebDriverWait(driver, 10).until(
        EC.presence_of_element_located((By.ID, 'meal-type'))
    )
    add_meal_btn = WebDriverWait(driver, 10).until(
        EC.presence_of_element_located((By.ID, 'add-meal'))
    )
    select = Select(meal_type_list)
    select.select_by_visible_text("drink")
    add_meal_btn.click()
    drink_section_btn = WebDriverWait(driver, 10).until(
        EC.element_to_be_clickable((By.XPATH, "//div[contains(@class,'fc-event-main-btn')][.//strong[text()='DRINK']]"))
    )
    drink_section_btn.click()
    modal_element = WebDriverWait(driver, 10).until(
        EC.presence_of_element_located((By.CLASS_NAME, 'modal'))
    )
    add_food_btn = modal_element.find_element(By.ID, 'add-food')
    assert add_food_btn.is_displayed(), "Add Food button should be visible"
    delete_meal_btn = modal_element.find_element(By.ID, 'remove-meal')
    assert delete_meal_btn.is_displayed(), "Delete meal button should be visible"
    active_meal_section = modal_element.find_element(By.ID, 'active-meal-foods')
    assert 'No food exists in this meal.' in active_meal_section.text, "Should have a note when no food exists in the meal"


def test_delete_meal_button(driver):
    driver.get(delete_add_meal_url)
    meal_type_list = WebDriverWait(driver, 10).until(
        EC.presence_of_element_located((By.ID, 'meal-type'))
    )
    add_meal_btn = WebDriverWait(driver, 10).until(
        EC.presence_of_element_located((By.ID, 'add-meal'))
    )
    select = Select(meal_type_list)
    select.select_by_visible_text("dinner")
    add_meal_btn.click()
    WebDriverWait(driver, 10).until(
        EC.element_to_be_clickable((By.XPATH, "//div[contains(@class,'fc-event-main-btn')]"))
    )
    meal_section_btns = WebDriverWait(driver, 10).until(
        EC.presence_of_all_elements_located(
            (By.XPATH, "//div[contains(@class,'fc-event-main-btn')]")
        )
    )
    test_meal_btn = meal_section_btns[0]
    test_meal = test_meal_btn.find_element(By.XPATH, ".//strong").text.upper()
    test_meal_btn.click()
    modal_element = WebDriverWait(driver, 10).until(
        EC.presence_of_element_located((By.CLASS_NAME, 'modal'))
    )
    delete_meal_btn = modal_element.find_element(By.ID, 'remove-meal')
    delete_meal_btn.click()
    WebDriverWait(driver, 10).until(
        EC.invisibility_of_element_located((By.CLASS_NAME, 'modal'))
    )
    time.sleep(6)
    remaining_meals = driver.find_elements(
        By.XPATH, f"//div[contains(@class,'fc-event-main-btn')][.//strong[text()='{test_meal}']]"
    )
    assert len(remaining_meals) == 0, "The meal should not be visible on the calendar"
    


