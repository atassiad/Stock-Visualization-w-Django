
$(document).ready(function(){
    // On page load, fetch stock data for AAPL by default from the Django backend for Stock Data
    $.ajax({
        type: "POST",
        url: "/get_stock_data/",
        cache: false,
        data: {
            'ticker': 'AAPL',
        },
        success: function (res, status) {
            // Use the symbol from the 'sma' metadata since the 'prices' endpoint returns only an informational message.
            var tickerDisplay = res['sma']['Meta Data']['1: Symbol'];
            var graphTitle = tickerDisplay + ' (data for the trailing 500 trading days)';

            // Extract SMA data
            var smaSeries = res['sma']['Technical Analysis: SMA'];
            var sma_data = [];
            var dates = [];
            for (let key in smaSeries) {
                sma_data.push(Number(smaSeries[key]['SMA']));
                dates.push(String(key));
            }
            
            // Reverse arrays so that data is in chronological order
            sma_data.reverse();
            dates.reverse();

            // Limit to the trailing 500 trading days
            var slicedDates = dates.slice(-500);
            var slicedSMA = sma_data.slice(-500);
            
            // Create the chart
            var ctx = document.getElementById('myChart').getContext('2d');
            new Chart(ctx, {
                type: 'line',
                data: {
                    labels: slicedDates,
                    datasets: [
                        {
                            label: 'Simple Moving Average (SMA)',
                            data: slicedSMA,
                            backgroundColor: 'blue',
                            borderColor: 'blue',
                            borderWidth: 1
                        },
                    ]
                },
                options: {
                    responsive: true,
                    scales: {
                        y: {
                            //beginAtZero: false
                        }
                    },
                    plugins: {
                        legend: {
                            position: 'top',
                        },
                        title: {
                            display: true,
                            text: graphTitle
                        }
                    }
                }
            });
        },
        error: function (err) {
            console.error("Error fetching default stock data:", err);
        }
    });

    // On page load, fetch crypto data for BTC by default from the Django backend for Crypto Data
    $.ajax({
        type: "POST",
        url: "/get_crypto_data/",
        data: {
            'currency_code': 'BTC',
        },
        success: function (res, status) {
            // Use the symbol from the crypto metadata
            var currencyCodeDisplay = res['Time Series (Digital Currency Daily)']['Meta Data']['3. Digital Currency Name'];
            var graphTitle = currencyCodeDisplay + ' (data for the trailing 500 trading days)';
            
            // Extract crypto data
            var timeSeries = res['Time Series (Digital Currency Daily)']['Time Series (Digital Currency Daily)'];
            var crypto_data = [];
            var dates = []
            for (let key in timeSeries) {
                crypto_data.push(Number(timeSeries[key]['4. close']));
                dates.push(String(key));
            }
            
            // Reverse arrays so that data is in chronological order
            crypto_data.reverse();
            dates.reverse();

            // Limit to the trailing 500 trading days
            var slicedDates = dates.slice(-500);
            var slicedCryptoData = crypto_data.slice(-500);
            
            // Create the chart
            var ctx = document.getElementById('myChart-2').getContext('2d');
            chart2 = new Chart(ctx, {
                type: 'line',
                data: {
                    labels: slicedDates,
                    datasets: [
                        {
                            label: 'Daily Close',
                            data: slicedCryptoData,
                            backgroundColor: 'blue',
                            borderColor: 'blue',
                            borderWidth: 1
                        },
                    ]
                },
                options: {
                    responsive: true,
                    scales: {
                        y: {
                            //beginAtZero: false
                        }
                    },
                    plugins: {
                        legend: {
                            position: 'top',
                        },
                        title: {
                            display: true,
                            text: graphTitle
                        }
                    }
                }
            });
        },
        error: function (err) {
            console.error("Error fetching default stock data:", err);
        }
    });
});

// Update stock chart when the user submits a new ticker
$('#submit-btn').click(function() {
    var tickerText = $('#ticker-input').val();
    $.ajax({
        type: "POST",
        url: "/get_stock_data/",
        data: {
            'ticker': tickerText,
        },
        success: function (res, status) {
            try {
                var tickerDisplay = res['sma']['Meta Data']['1: Symbol'];
                var graphTitle = tickerDisplay + ' (data for the trailing 500 trading days)';
            } catch(error) {
                if (error instanceof TypeError){
                    console.error("ERROR: Invalid ticker, or unable to query ticker", error.message);
                    return 1;
                }
                console.error("ERROR: ", error.message);
                return 1;
            } 

            //update dates and smaseries data
            var dates = [];
            var smaSeries = res['sma']['Technical Analysis: SMA'];
            var sma_data = [];
            for (let key in smaSeries) {
                sma_data.push(Number(smaSeries[key]['SMA']));
                dates.push(String(key));
            }
            
            sma_data.reverse();
            dates.reverse();
            
            var slicedDates = dates.slice(-500);
            var slicedSMA = sma_data.slice(-500);

            // Remove the existing canvas and create a new one
            $('#myChart').remove();
            $('#graph-area').append('<canvas id="myChart"></canvas>');
            var ctx = document.getElementById('myChart').getContext('2d');
            new Chart(ctx, {
                type: 'line',
                data: {
                    labels: slicedDates,
                    datasets: [
                        {
                            label: 'Simple Moving Average (SMA)',
                            data: slicedSMA,
                            backgroundColor: 'blue',
                            borderColor: 'blue',
                            borderWidth: 1
                        },
                    ]
                },
                options: {
                    responsive: true,
                    scales: {
                        y: {
                            //beginAtZero: false
                        }
                    },
                    plugins: {
                        legend: {
                            position: 'top',
                        },
                        title: {
                            display: true,
                            text: graphTitle
                        }
                    }
                }
            });
        },
        error: function (err) {
            console.error("Error fetching stock data for ticker:", tickerText, err);
        }
    });
});

// Update crypto chart when user submits new currency_code
$('#submit-btn-2').click(function() {
    var currency_code = $('#currency_code').val();
    $.ajax({
        type: "POST",
        url: "/get_crypto_data/",
        data: {
            'currency_code': currency_code,
        },
        success: function (res, status) {
            // Use the symbol from the crytpo metadata
            try {
                var currencyCodeDisplay = res['Time Series (Digital Currency Daily)']['Meta Data']['3. Digital Currency Name'];
                var graphTitle = currencyCodeDisplay + ' (data for the trailing 500 trading days)';
            } catch(error) {
                if (error instanceof TypeError){
                    console.error("ERROR: Invalid currency code, or unable to query currency code", error.message);
                    return 1;
                }
                console.error("ERROR: ", error.message);
                return 1;
            } 
            
            // Extract crypto data
            var timeSeries = res['Time Series (Digital Currency Daily)']['Time Series (Digital Currency Daily)'];
            var crypto_data = [];
            var dates = []
            for (let key in timeSeries) {
                crypto_data.push(Number(timeSeries[key]['4. close']));
                dates.push(String(key));
            }
            
            // Reverse arrays so that data is in chronological order
            crypto_data.reverse();
            dates.reverse();

            // Limit to the trailing 500 trading days
            var slicedDates = dates.slice(-500);
            var slicedCryptoData = crypto_data.slice(-500);

            // Remove the existing canvas and create a new one
            $('#myChart-2').remove();
            $('#graph-area-2').append('<canvas id="myChart-2"></canvas>');
            var ctx = document.getElementById('myChart-2').getContext('2d');
            new Chart(ctx, {
                type: 'line',
                data: {
                    labels: slicedDates,
                    datasets: [
                        {
                            label: 'Daily Close',
                            data: slicedCryptoData,
                            backgroundColor: 'blue',
                            borderColor: 'blue',
                            borderWidth: 1
                        },
                    ]
                },
                options: {
                    responsive: true,
                    scales: {
                        y: {
                            //beginAtZero: false
                        }
                    },
                    plugins: {
                        legend: {
                            position: 'top',
                        },
                        title: {
                            display: true,
                            text: graphTitle
                        }
                    }
                }
            });
        },
        error: function (err) {
            console.error("Error fetching stock data for ticker:", tickerText, err);
        }
    });
});