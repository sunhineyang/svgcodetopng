import json, urllib.request, ssl

ctx = ssl.create_default_context()
ctx.check_hostname = False
ctx.verify_mode = ssl.CERT_NONE

key = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InltcmFpZ25ya2Jsb253ZnZva3V6Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3OTcwOTYzOSwiZXhwIjoyMDk1Mjg1NjM5fQ.Z927lYnJMC3MW260vskM30xg3YOqUhTKo5evanhwjoY'
base = 'https://ymraignrkblonwfvokuz.supabase.co/rest/v1'
storage_base = 'https://ymraignrkblonwfvokuz.supabase.co/storage/v1'

def api(method, url, data=None):
    headers = {
        'apikey': key,
        'Authorization': f'Bearer {key}',
        'Content-Type': 'application/json',
        'Prefer': 'return=representation'
    }
    body = json.dumps(data).encode() if data else None
    req = urllib.request.Request(url, data=body, headers=headers, method=method)
    try:
        resp = urllib.request.urlopen(req, context=ctx)
        return resp.status, resp.read().decode()
    except urllib.error.HTTPError as e:
        return e.code, e.read().decode()

# 1. Get all IDs
status, body = api('GET', f'{base}/feedback?select=id')
all_records = json.loads(body)
all_ids = [r['id'] for r in all_records]
print(f'Total records: {len(all_ids)}')

# 2. Delete using in.(id1,id2,...)
id_list = ','.join(all_ids)
status, body = api('DELETE', f'{base}/feedback?id=in.({id_list})')
print(f'DELETE status: {status}')
if body:
    try:
        deleted = json.loads(body)
        print(f'Deleted: {len(deleted)} records')
    except:
        print(f'Response: {body[:300]}')

# 3. Verify
status, body = api('GET', f'{base}/feedback?select=id')
remaining = json.loads(body)
print(f'Remaining: {len(remaining)}')

# 4. Clean storage
print('\n--- Storage cleanup ---')
status, body = api('POST', f'{storage_base}/object/list/feedback-svgs', {"prefix": "2026/", "limit": 1000})
print(f'List status: {status}')
if status == 200:
    objects = json.loads(body)
    print(f'Files: {len(objects)}')
    paths = []
    for obj in objects:
        name = obj.get('name', '')
        print(f'  {name}')
        paths.append(name)
    if paths:
        s, b = api('DELETE', f'{storage_base}/object/feedback-svgs', {"prefixes": paths})
        print(f'Delete status: {s}')
else:
    print(f'Response: {body[:300]}')

# 5. Final check
status, body = api('GET', f'{base}/feedback?select=id')
final = json.loads(body)
print(f'\nFinal count: {len(final)}')
print('Done!')
