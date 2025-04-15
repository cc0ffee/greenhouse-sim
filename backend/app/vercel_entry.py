from mangum import Mangum
from app.server.api import app

handler = Mangum(app)