from django.shortcuts import render
from django.http import HttpResponse
from django.views.decorators.csrf import csrf_exempt
from .models import StockData
from .models import CryptoData
from dotenv import load_dotenv
import os

import requests
import json


load_dotenv()
APIKEY = os.environ.get('api_key') #Note: This is free API key
#replace 'my_alphav_api_key' with your actual Alpha Vantage API key obtained from https://www.alphavantage.co/support/#api-key


DATABASE_ACCESS = True 
#if False, the app will always query the Alpha Vantage APIs regardless of whether the stock data for a given ticker is already in the local database


# Create your views here.
def home(request):
    return render(request, 'home.html', {})

@csrf_exempt
def get_stock_data(request):
    if request.headers.get('x-requested-with') == 'XMLHttpRequest':
        ticker = request.POST.get('ticker', 'null')
        ticker = ticker.upper()

        if DATABASE_ACCESS == True:
            #checking if the database already has data stored for this ticker before querying the Alpha Vantage API
            if StockData.objects.filter(symbol=ticker).exists(): 
                entry = StockData.objects.filter(symbol=ticker)[0]
                return HttpResponse(entry.data, content_type='application/json')

        output_dictionary = {}

        sma_series = requests.get(f'https://www.alphavantage.co/query?function=SMA&symbol={ticker}&interval=daily&time_period=10&series_type=close&apikey={APIKEY}').json()
        
        output_dictionary['sma'] = sma_series
        
        temp = StockData(symbol=ticker, data=json.dumps(output_dictionary))
        temp.save()

        return HttpResponse(json.dumps(output_dictionary), content_type='application/json')

    else:
        message = "Not Ajax"
        return HttpResponse(message)
    
#get bitcoin prices
@csrf_exempt
def get_crypto_data(request):
    if request.headers.get('x-requested-with') == 'XMLHttpRequest':
        currency_code = request.POST.get('currency_code', 'null')
        currency_code = currency_code.upper()

        if DATABASE_ACCESS == True:
            #checking if the database already has data stored for this ticker before querying the Alpha Vantage API
            if CryptoData.objects.filter(symbol=currency_code).exists(): 
                entry = CryptoData.objects.filter(symbol=currency_code)[0]
                return HttpResponse(entry.data, content_type='application/json')

        output_dictionary = {}

        digital_currency_daily = requests.get(f'https://www.alphavantage.co/query?function=DIGITAL_CURRENCY_DAILY&symbol={currency_code}&market=USD&apikey={APIKEY}').json()

        output_dictionary['Time Series (Digital Currency Daily)'] = digital_currency_daily

        temp = CryptoData(symbol=currency_code, data=json.dumps(output_dictionary))
        temp.save()

        return HttpResponse(json.dumps(output_dictionary), content_type='application/json')

    else:
        message = "Not Ajax"
        return HttpResponse(message)