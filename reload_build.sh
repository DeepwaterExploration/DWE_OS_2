cd ./frontend
npm run build
cd ..
cd ./system_api
go build .
cd ..
./run_release.sh