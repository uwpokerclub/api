import pandas as pd
import requests
import json
import time
import os

with open('config.json') as config_file:
    config = json.load(config_file)

url = config['api']['url']
login_payload = json.dumps(config['login']).encode("utf-8")

Event_ID = config['event']['Event_ID']
timestr = time.strftime("%H-%M-%S_%Y%m%d")

SHEET_ID = config['sheet']['Sheet_ID']
SHEET_NAME = 'TEMPNAME'

def write_json(new_data, filename):
    desired_dir = r"Events"
    full_path = os.path.join(desired_dir, filename)
    with open(full_path, 'w') as f:
        json_string=json.dumps(new_data)
        f.write(json_string)


def makeJsonDict(file,name: str):
    eventDict = {}
    for entry in file:
        eventDict[entry['userId']] = [entry['id'],entry['paid']]
        #print(eventDict[entry['userId']])

    write_json(eventDict,f'{name}_{timestr}.json')
    
    return eventDict

def registerUsers(userDictionary: dict,semester: str):
    unpaid = []
    unregistered =[]
    success = []
    googleURL = f'https://docs.google.com/spreadsheets/d/{SHEET_ID}/gviz/tq?tqx=out:csv&sheet=TEMPNAME'
    df = pd.read_csv(googleURL,on_bad_lines = 'warn')
    StudentsDF = df['Student ID']

    for i in range(len(StudentsDF)):
        if StudentsDF[i] in userDictionary:
            if userDictionary[StudentsDF[i]][1] == True:
                user= {
                    'eventId':Event_ID,
                    'membershipId':userDictionary[StudentsDF[i]][0]
                    }
                user_payload = json.dumps(user).encode("utf-8")

                try:
                    r2 = s.post(url+'/participants',data=user_payload)
                    success.append(int(StudentsDF[i]))

                except requests.exceptions.HTTPError as e:
                    print(e.response.text)
                    print(user_json)
            else:
                unpaid.append(int(StudentsDF[i]))
        else:
            unregistered.append(int(StudentsDF[i]))

    successJson,unregisteredJson, unpaidJson = json.dumps(success),json.dumps(unregistered),json.dumps(unpaid)

    responseDict = {
        'success':successJson,
        'unregistered':unregisteredJson,
        'unpaid':unpaidJson
    }
    
    write_json(responseDict,f'Event{Event_ID}_{timestr}_Respose.json')

    return responseDict

with requests.Session() as s:
    p = s.post(url + '/login/session', data=login_payload)
    
    try:
        r = s.get(url + f'/events/{Event_ID}')
        semID=(r.json().get("semesterId"))
        
        r1 = s.get(url + f'/memberships?semesterId={semID}')
        r1json = json.loads(r1.content)
        
        eventDict = makeJsonDict(r1json,f'Event{Event_ID}')

        finalResponse = registerUsers(eventDict,f'{semID}')

        print(finalResponse)


    except requests.exceptions.HTTPError as e:
        print(e.response.text)
        print(user_json)

