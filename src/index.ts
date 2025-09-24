import { Hono } from "hono";

const app = new Hono();

const welcomeStrings = [
  "Hello Hono!",
  "To learn more about Hono on Vercel, visit https://vercel.com/docs/frameworks/backend/hono",
];

app.get("/", (c) => {
  return c.text(welcomeStrings.join("\n\n"));
});

app.get("/video", async (c) => {
  try {
    // Fetch the remote MP4
    const remoteUrl =
      "https://usa7-nas27-1.shegu.net/vip/p4/2023/11/16/16/6555d1ca1efd15.15869365.mp4?KEY1=lKFla_4wweXshKQIVaDjKA&KEY2=1758693237&KEY3=979224&KEY4=world&KEY5=5752729-uhd_3840_2160_30fps.mp4&KEY7=febbox_video_quality_list_v3&KEY8=979224";

    const response = await fetch(remoteUrl);

    if (!response.ok) {
      return c.text(`Remote fetch failed: ${response.status}`, 502);
    }

    // Create a new Response that streams the body
    return new Response(response.body, {
      status: 200,
      headers: {
        "Access-Control-Allow-Origin": "*", // allow browser fetch()
        "Content-Type": response.headers.get("content-type") || "video/mp4",
        "Cache-Control": "no-cache",
      },
    });
  } catch (err) {
    return c.text(`Error: ${(err as Error).message}`, 500);
  }
});

export default app;
