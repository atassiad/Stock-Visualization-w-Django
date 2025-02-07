from django.db import models

# Create your models here.
#StockData Database
class StockData(models.Model):
    symbol = models.TextField(null=True)
    data = models.TextField(null=True)

#CryptoData DataBase
class CryptoData(models.Model):
    symbol = models.TextField(null=True)
    data = models.TextField(null=True)