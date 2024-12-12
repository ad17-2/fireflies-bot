# init-mongo.sh
#!/bin/sh
echo "Waiting for MongoDB to start..."
until mongosh --host mongodb --eval "print(\"waited for connection\")"
do
    sleep 2
done
echo "MongoDB is up - executing seed"
npm run seed