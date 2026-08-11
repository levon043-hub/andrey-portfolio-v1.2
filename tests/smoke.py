import os
from pathlib import Path

from playwright.sync_api import sync_playwright


BASE_URL = os.environ.get("BASE_URL", "http://127.0.0.1:5174/")
ARTIFACTS = Path("test-results")


def assert_no_page_errors(errors):
    assert not errors, "Unexpected page errors: " + " | ".join(errors)


def main():
    ARTIFACTS.mkdir(exist_ok=True)
    with sync_playwright() as playwright:
        browser = playwright.chromium.launch(headless=True)
        errors = []
        desktop = browser.new_page(viewport={"width": 1440, "height": 900})
        desktop.on("pageerror", lambda error: errors.append(str(error)))
        desktop.goto(BASE_URL, wait_until="networkidle")
        assert desktop.locator("h1").inner_text().startswith("Лендинги под ключ")
        assert desktop.locator("canvas").count() == 1
        dimensions = desktop.evaluate("""() => ({ scrollWidth: document.documentElement.scrollWidth, clientWidth: document.documentElement.clientWidth })""")
        assert dimensions["scrollWidth"] <= dimensions["clientWidth"] + 1
        desktop.screenshot(path=str(ARTIFACTS / "desktop-home.png"), full_page=True)
        desktop.get_by_role("link", name="Смотреть кейс").first.click()
        assert desktop.locator("dialog").evaluate("node => node.open") is True
        assert desktop.url.endswith("#project/ecowood")
        desktop.keyboard.press("Escape")
        assert desktop.locator("dialog").evaluate("node => node.open") is False
        direct = browser.new_page(viewport={"width": 1440, "height": 900})
        direct.goto(f"{BASE_URL}#project/ecowood", wait_until="networkidle")
        assert direct.locator("dialog").evaluate("node => node.open") is True
        direct.locator("[data-drawer-close]").click()
        assert direct.url.endswith("#portfolio")
        assert direct.locator("#portfolio").evaluate("node => document.activeElement === node") is True
        desktop.get_by_role("button", name="Сколько стоит лендинг?").click()
        assert desktop.locator("#answer-price").evaluate("node => !node.hidden") is True

        mobile = browser.new_page(viewport={"width": 390, "height": 844})
        mobile.goto(BASE_URL, wait_until="networkidle")
        mobile_dimensions = mobile.evaluate("""() => ({ scrollWidth: document.documentElement.scrollWidth, clientWidth: document.documentElement.clientWidth, webgl: document.querySelector('[data-hero-visual]').classList.contains('is-webgl-ready') })""")
        assert mobile_dimensions["scrollWidth"] <= mobile_dimensions["clientWidth"] + 1
        assert mobile_dimensions["webgl"] is False
        mobile.screenshot(path=str(ARTIFACTS / "mobile-home.png"), full_page=True)
        mobile.get_by_role("button", name="Следующий избранный проект").click()
        assert mobile.locator("[data-project-position]").inner_text() == "02 / 05"
        mobile.get_by_role("button", name="Открыть меню").click()
        assert mobile.locator("[data-menu-button]").get_attribute("aria-expanded") == "true"
        mobile.keyboard.press("Escape")
        assert mobile.locator("[data-menu-button]").get_attribute("aria-expanded") == "false"

        no_js = browser.new_page(viewport={"width": 1280, "height": 720}, java_script_enabled=False)
        no_js.goto(BASE_URL, wait_until="domcontentloaded")
        assert no_js.locator("h1").inner_text().startswith("Лендинги под ключ")
        assert no_js.locator("body").evaluate("node => getComputedStyle(node).opacity") == "1"
        assert "статичный список проектов" in no_js.locator("body").inner_text()
        assert_no_page_errors(errors)
        browser.close()


if __name__ == "__main__":
    main()
