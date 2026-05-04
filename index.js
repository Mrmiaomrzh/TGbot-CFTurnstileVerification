export default {
    async fetch(request, env) {
      const url = new URL(request.url);
      
      if (request.method === "POST" && url.pathname === "/webhook") {
        const update = await request.json();
        if (update.message?.text === "/start") {
          const chatId = update.message.chat.id;
          const verifyUrl = `https://<YOUR-PAGES-LINK>/?u=${chatId}`;
          
          await fetch(`https://api.telegram.org/bot${env.BOT_TOKEN}/sendMessage`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              chat_id: chatId,
              text: "🛡️ 为了安全，请先点击链接完成验证：",
              reply_markup: { inline_keyboard: [[{ text: "开始验证", url: verifyUrl }]] }
            })
          });
        }
        return new Response("OK");
      }
  
      // 验证请求
      if (request.method === "POST" && url.pathname === "/verify") {
        const { token, uid } = await request.json();
  
        // 校验 Turnstile
        const formData = new FormData();
        formData.append("secret", env.TURNSTILE_SECRET);
        formData.append("response", token);
  
        const cfRes = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
          method: "POST",
          body: formData
        });
        const cfData = await cfRes.json();
  
        if (cfData.success) {
          // 防止重复点击导致多次发包 (KV 存储 5 分钟有效期)
          const cacheKey = `v_${uid}`;
          if (await env.BOT_KV.get(cacheKey)) {
            return new Response(JSON.stringify({ success: false, error: "请勿重复验证" }));
          }
          await env.BOT_KV.put(cacheKey, "true", { expirationTtl: 300 });
            const fileUrl = "<DownloadFilesUrl>";
    
            // 远程下载文件流
            const fileResponse = await fetch(fileUrl);
            const fileBlob = await fileResponse.blob();

            // 构建 multipart/form-data
            const sendData = new FormData();
            sendData.append('chat_id', uid);
            // 'document' 是发送文件的字段名，'file.zip' 是文件名
            sendData.append('document', fileBlob, 'files.zip'); 
            sendData.append('caption', '✅ 验证成功！这是您的专属文件。');

            // Telegram API sendDocument
            await fetch(`https://api.telegram.org/bot${env.BOT_TOKEN}/sendDocument`, {
                method: "POST",
                body: sendData
            });

        return new Response(JSON.stringify({ success: true }));
      }

        return new Response(JSON.stringify({ success: false, error: "验证无效" }), { status: 403 });
      }
  
      return new Response("Not Found", { status: 404 });
    }
  };