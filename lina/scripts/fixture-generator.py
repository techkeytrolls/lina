import datetime
import time
import random
from datetime import timedelta
date = datetime.datetime.now()

for x in xrange(7):
    date = date - timedelta(days=1)
    epoch = time.mktime(date.timetuple())
    
    emo = ['Sad', 'Happy']
    randomEmo = random.choice(emo)
    
    print ("tx.executeSql('INSERT INTO demo (id, data, note) VALUES ({}, \"{}\", \"{}\")')".format(epoch, randomEmo, "This is a test")) 