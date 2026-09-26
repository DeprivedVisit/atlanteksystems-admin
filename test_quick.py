from playwright.sync_api import sync_playwright

with sync_playwright() as p:
    browser = p.chromium.launch(headless=True)
    page = browser.new_page(viewport={"width": 375, "height": 667})
    page.goto("https://atlanteksystems.com/", wait_until="networkidle", timeout=30000)
    
    has_rate = page.evaluate("typeof checkRateLimit === 'function'")
    print("Rate limit fn:", has_rate)
    
    has_sanitize = page.evaluate("typeof sanitize === 'function'")
    print("Sanitize fn:", has_sanitize)
    
    has_validate = page.evaluate("typeof validatePhoneCR === 'function'")
    print("Validate phone fn:", has_validate)
    
    hint = page.locator(".field-hint").is_visible()
    print("Field hint:", hint)
    
    hp = page.locator(".lead-form__hp").count()
    print("Honeypot count:", hp)
    
    browser.close()