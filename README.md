# Tool Forward Assistant

Forward Assistant là một ứng dụng được tạo ra từ NodeJS và node-bot-telegram-api. Nó giúp bạn dễ dàng chuyển tiếp (forward) tin nhắn từ một người dùng tới một nhóm hoặc một kênh khác trên Telegram.

## Cách sử dụng

### Tải ứng dụng

Bạn có thể tải ứng dụng từ phần [Release]([https://github.com/kigaijidev/tool-forward-telegram](https://github.com/kigaijidev/tool-forward-telegram) trên GitHub. 
- Copy file `.env.example` ra file mới tên `.env`. Nhập token của BOT và group_id nếu có.
- Bạn cần cài đặt các dependencies bằng lệnh `npm install`, sau đó chạy ứng dụng bằng lệnh `npm run start`. 

### Cài đặt và sử dụng

1. **Nhập TOKEN của BOT Telegram**: Trước tiên, bạn cần có một bot Telegram. Nếu bạn chưa có, hãy [tạo một bot mới](https://core.telegram.org/bots#3-how-do-i-create-a-bot) trên Telegram và lấy TOKEN của bot đó.

2. **Start**: Trước tiên hãy thêm bot Telegram vào 2 nhóm cần forward. Sau đó mở tool và nhập TOKEN, nhấn vào nút "Start" để bắt đầu chạy bot.

3. **Stop**: Nếu bạn muốn tạm dừng hoạt động của bot, bạn có thể nhấn vào nút "Stop".

4. **Reset**: Nếu bạn muốn xóa cache và nhập lại TOKEN, bạn có thể nhấn vào nút "Reset".

## Hướng dẫn tạo BOT Telegram

Bạn có thể tạo một BOT Telegram mới bằng cách thực hiện các bước sau:

1. Mở Telegram và tìm kiếm BotFather (tài khoản @BotFather).

2. Bắt đầu một cuộc trò chuyện mới với BotFather và sử dụng lệnh `/newbot` để tạo bot mới.

3. Theo hướng dẫn từ BotFather, nhập tên cho bot của bạn và sau đó nhập username cho bot (phải kết thúc bằng "bot").

4. BotFather sẽ cung cấp cho bạn một TOKEN. Hãy lưu trữ TOKEN này vì bạn sẽ cần nó để sử dụng trong Forward Assistant.

5. Khi tạo xong bot, bạn hãy sử dụng lệnh `/mybots` và chọn bot vừa tạo, chọn `Bot Settings` -> `Group Privacy` -> `Turn off` (nếu thấy `Privacy mode is disabled` là đúng).

6. Ngoài ra, bạn có thể sử dụng các lệnh khác của BotFather để cấu hình thêm các tính năng cho bot của mình (tùy chọn).

## Đóng góp

Nếu bạn muốn đóng góp vào dự án, vui lòng mở một issue hoặc gửi pull request trên GitHub.

## Giấy phép

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
