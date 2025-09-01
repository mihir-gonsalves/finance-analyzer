Using this to take notes on how i created this and make comments. Quick note - this is being developed via Test Driven Development.

1.

First, I researched how to get data from my bank and credit card accounts. 

Turns out it's a lot of work to setup API endpoints for these accounts - you have to register and get accepted directly by the institutions. 

I found that you can simply download a .csv file of all your transactions instead. 

I haven't looked into it yet - but because a ledger is publicly available for all eyes, I'm assuming that it will be much easier to get access to API endpoints for crypto wallets. 

For now to avoid having to comply with Finra/SEC regulations - I will force users to manually download and upload their .csv transactions to the application. (FYI - the application is offline so there should be no room for security concerns).

To demonstrate automatic API connectivity - users will be able to connect their cryptocurrency wallets to the application. 

2. 

I will first start by creating a file that parses the .csv files. Seeing that different institutions have different formats for these files - I will have to create a standardized format to pull the information into.

3.

Next we have to store the data in a database. I will be using SQLAlchemy as my ORM and keep the data in SQLite. The database table will be setup using the standardized format created in step 2 (models.py). I will also create the actual database in database.py. 

To move the parsed data into the db, I will create a file loaders.py and also create functions that will let users easily write up queries (in queries.py) to get data. 