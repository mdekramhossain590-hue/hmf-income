with open("firestore.rules", "r") as f:
    rules = f.read()

rules = rules.replace(
    "request.resource.data.wallet != 'partner'",
    "(!('wallet' in request.resource.data) || request.resource.data.wallet != 'partner')"
)

with open("firestore.rules", "w") as f:
    f.write(rules)
