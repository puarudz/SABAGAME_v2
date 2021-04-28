V4: cập nhật giao diện người dùng
config .env
config config/databse.js
chạy lệnh npm install (nên dùng nodejs  v8.1)
nếu có lỗi với gói package bcrypt
thì 
npm install node-pre-gyp -g
npm rebuild bcrypt --build-from-source
npm install bcrypt
tham khảo để fix: https://stackoverflow.com/questions/60962219/error-bcrypt-lib-node-is-not-a-valid-win32-application

mở port tương ứng với .env
npm start
