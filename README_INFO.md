cd frontend
npm run build
cd ..
docker-compose down
docker-compose up -d --build
docker-compose ps

# 1. Check if containers are healthy
# 2. Check frontend logs
# 3. Test if nginx is serving files
# 4. Test if backend is working
# 5. List files in frontend container
docker-compose ps
docker-compose logs frontend --tail=20
curl -I http://localhost:3000
curl http://localhost:5000/api/test
docker exec dumy-frontend-1 ls -la /usr/share/nginx/html/