from fastapi import FastAPI

app = FastAPI(title="API Base", version="1.0.0")


@app.get("/")
def root():
    return {"status": "ok", "service": "API Base"}


@app.get("/health")
def health():
    return {"status": "healthy"}
