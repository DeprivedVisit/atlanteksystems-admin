from playwright.sync_api import sync_playwright
import os

URL = "https://atlanteksystems.com/"

VIEWPORTS = [
    ("iPhone SE (375px)", 375, 667),
    ("iPhone 14 (390px)", 390, 844),
    ("Tablet (768px)", 768, 1024),
    ("Laptop (1280px)", 1280, 720),
    ("Desktop (1440px)", 1440, 900),
    ("Large Desktop (1920px)", 1920, 1080),
]

OUTPUT_DIR = "F:/apex-cloudworks/test_screenshots"
os.makedirs(OUTPUT_DIR, exist_ok=True)

def test_viewport(name, width, height):
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page(viewport={"width": width, "height": height})
        
        try:
            print(f"\nTesting {name} ({width}x{height})...")
            page.goto(URL, wait_until="networkidle", timeout=30000)
            page.wait_for_timeout(1000)
            
            # Screenshot full page
            screenshot_path = f"{OUTPUT_DIR}/{name.replace(' ', '_').replace('(', '').replace(')', '')}.png"
            page.screenshot(path=screenshot_path, full_page=True)
            print(f"   OK Screenshot: {screenshot_path}")
            
            # Check for horizontal scroll
            scroll_width = page.evaluate("document.documentElement.scrollWidth")
            client_width = page.evaluate("document.documentElement.clientWidth")
            has_h_scroll = scroll_width > client_width
            print(f"   Horizontal scroll: {'FAIL (PROBLEMA)' if has_h_scroll else 'OK'}")
            
            # Check key elements visibility
            checks = {
                "Hero visible": page.locator("#inicio").is_visible(),
                "Nav visible": page.locator(".nav").is_visible(),
                "CTA WhatsApp": page.locator(".wa-float").is_visible(),
                "CTA Form": page.locator(".fab-form").is_visible(),
                "Chat FAB": page.locator(".chat-fab").is_visible(),
                "Services section": page.locator("#servicios").is_visible(),
                "Coverage section": page.locator("#cobertura").is_visible(),
                "Contact form": page.locator("#lead-form").is_visible(),
                "Footer": page.locator(".footer").is_visible(),
            }
            
            for label, check in checks.items():
                result = "OK" if check else "FAIL"
                print(f"   {result} {label}")
            
            # Mobile menu check
            if width < 680:
                burger = page.locator(".nav__burger")
                if burger.is_visible():
                    burger.click()
                    page.wait_for_timeout(300)
                    menu_open = page.locator(".nav__links").is_visible()
                    print(f"   {'OK' if menu_open else 'FAIL'} Mobile menu opens")
                    burger.click()  # close
            
            # Chat functionality
            chat_fab = page.locator(".chat-fab")
            if chat_fab.is_visible():
                chat_fab.click()
                page.wait_for_timeout(500)
                panel_open = page.locator(".chat-panel.is-open").is_visible()
                print(f"   {'OK' if panel_open else 'FAIL'} Chat panel opens")
                if panel_open:
                    chips = page.locator(".chat-panel__chips .chip").count()
                    print(f"   OK Chat chips: {chips} preguntas")
                    # Test first chip
                    if chips > 0:
                        page.locator(".chat-panel__chips .chip").first.click()
                        page.wait_for_timeout(800)
                        msgs = page.locator(".chat-msg").count()
                        print(f"   OK Chat responde: {msgs} mensajes")
                
                # Close chat
                page.locator(".chat-panel__close").click()
                page.wait_for_timeout(300)
            
            # Form validation
            form = page.locator("#lead-form")
            if form.is_visible():
                nombre = page.locator("#nombre")
                telefono = page.locator("#telefono")
                if nombre.is_visible() and telefono.is_visible():
                    print("   OK Formulario visible y accesible")
            
        except Exception as e:
            print(f"   FAIL ERROR: {e}")
        finally:
            browser.close()

if __name__ == "__main__":
    print(f"Testing {URL} on {len(VIEWPORTS)} viewports...")
    for name, w, h in VIEWPORTS:
        test_viewport(name, w, h)
    print(f"\nScreenshots saved to {OUTPUT_DIR}")