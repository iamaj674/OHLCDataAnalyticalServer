
#Introduction
an Analytical Server to emit "OHLC" (Open/High/Low/Close) time series based on the 'Trades' input dataset.

#Requirment / Prerequisite.
Latest node version installed.

#Steps to Setup Analytical Server
1. Download & Extract Source code.
2. Open terminal goto project root folder 
3. type:  NPM Install

#Steps to run Analytical Server
1. Execute : "NPM start" command to start Analytical Server 

#Send event to receive data from Analytical Server
1) Install wscat globally  by executing "npm install -g wscat" command.
2) Establish connection with web socket => wscat -c localhost:8080
3) Do Request for Symbol data after connection successful => {"event": "subscribe", "symbol": "XXBTZUSD", "interval": 15}

#You can use any value for symbol within given dataset. below are the input for few symbols

{"event": "subscribe", "symbol": "XXBTZUSD", "interval": 15}
{"event": "subscribe", "symbol": "GNOXBT", "interval": 15}
{"event": "subscribe", "symbol": "ADAXBT", "interval": 15}
{"event": "subscribe", "symbol": "XXRPXXBT", "interval": 15}
{"event": "subscribe", "symbol": "XMLNXXBT", "interval": 15}
