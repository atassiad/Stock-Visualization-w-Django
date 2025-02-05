$(document).ready(function(){
    // On page load, fetch stock data for AAPL by default from the Django backend.
    $.ajax({
        type: "POST",
        url: "/get_stock_data/",
        data: {
            'ticker': 'AAPL',
        },
        success: function (res, status) {
            // Use the symbol from the 'sma' metadata since the 'prices' endpoint returns only an informational message.
            var tickerDisplay = res['sma']['Meta Data']['1: Symbol'];
            var graphTitle = tickerDisplay + ' (data for the trailing 500 trading days)';

            // Extract price data
            var priceSeries = res['prices']['Time Series (Daily)'];
            var daily_adjusted_close = [];
            var dates = [];
            for (let key in priceSeries) {
                daily_adjusted_close.push(Number(priceSeries[key]['5. adjusted close']));
                dates.push(String(key));
            }
            
            // Extract SMA data
            var smaSeries = res['sma']['Technical Analysis: SMA'];
            var sma_data = [];
            for (let key in smaSeries) {
                sma_data.push(Number(smaSeries[key]['SMA']));
                dates.push(String(key));
            }
            
            // Reverse arrays so that data is in chronological order
            daily_adjusted_close.reverse();
            sma_data.reverse();
            dates.reverse();

            // Limit to the trailing 500 trading days
            var slicedDates = dates.slice(-500);
            var slicedPrices = daily_adjusted_close.slice(-500);
            var slicedSMA = sma_data.slice(-500);
            
            // Create the chart
            var ctx = document.getElementById('myChart').getContext('2d');
            new Chart(ctx, {
                type: 'line',
                data: {
                    labels: slicedDates,
                    datasets: [
                        {
                            label: 'Daily Adjusted Close',
                            data: slicedPrices,
                            backgroundColor: 'green',
                            borderColor: 'green',
                            borderWidth: 1
                        },
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
});

// Update chart when the user submits a new ticker
$('#submit-btn').click(function() {
    var tickerText = $('#ticker-input').val();
    $.ajax({
        type: "POST",
        url: "/get_stock_data/",
        data: {
            'ticker': tickerText,
        },
        success: function (res, status) {
            var tickerDisplay = res['sma']['Meta Data']['1: Symbol'];
            var graphTitle = tickerDisplay + ' (data for the trailing 500 trading days)';

            var priceSeries = res['prices']['Time Series (Daily)'];
            var daily_adjusted_close = [];
            var dates = [];
            for (let key in priceSeries) {
                daily_adjusted_close.push(Number(priceSeries[key]['5. adjusted close']));
                dates.push(String(key));
            }
            
            var smaSeries = res['sma']['Technical Analysis: SMA'];
            var sma_data = [];
            for (let key in smaSeries) {
                sma_data.push(Number(smaSeries[key]['SMA']));
                dates.push(String(key));
            }
            
            daily_adjusted_close.reverse();
            sma_data.reverse();
            dates.reverse();
            
            var slicedDates = dates.slice(-500);
            var slicedPrices = daily_adjusted_close.slice(-500);
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
                            label: 'Daily Adjusted Close',
                            data: slicedPrices,
                            backgroundColor: 'green',
                            borderColor: 'green',
                            borderWidth: 1
                        },
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