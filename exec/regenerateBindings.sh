daml build
rm -r scala-codegen/src
daml codegen scala

cd ui
rm -r daml.js
rm -r node_modules/@daml.js
daml codegen js ../.daml/dist/create-daml-app-0.1.0.dar -o ui/daml.js
npm install