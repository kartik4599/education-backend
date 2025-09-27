import axios from "axios";
import { Hono } from "hono";

const app = new Hono();

const welcomeStrings = [
  "Hello Hono!",
  "To learn more about Hono on Vercel, visit https://vercel.com/docs/frameworks/backend/hono",
];

app.get("/", (c) => {
  return c.text(welcomeStrings.join("\n\n"));
});

function fetchVideoUrl(html: string): string | null {
  // Regex to match mp4 URLs inside "file":"...mp4?...".
  const regex = /"file"\s*:\s*"([^"]+\.mp4[^"]*)"/i;

  const match = html.match(regex);
  if (match && match[1]) {
    return match[1]
      .replace(/\\\//g, "/") // remove escaped slashes
      .trim();
  }
  return null;
}

app.get("/video", async (c) => {
  try {
    // Fetch the remote MP4
    const formData = new FormData();
    formData.append("fid", "31310808");

    const { data } = await axios.post(
      "https://www.febbox.com/console/player",
      formData,
      {
        headers: {
          Cookie:
            "ui=eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpYXQiOjE3NTYzOTIyNzAsIm5iZiI6MTc1NjM5MjI3MCwiZXhwIjoxNzg3NDk2MjkwLCJkYXRhIjp7InVpZCI6OTc5MjI0LCJ0b2tlbiI6ImU1OTE5MGViNGI0ZWRmMzExOTU3M2Q4MDVmNzZlODQ0In19.WFAOLTcEHUUV-lKQFfWtg2rj7BxudB2Opb_vxmEyYmQ; PHPSESSID=1odu7rmftn332ujmm4lnpvip5o; list_mode=grid2; cf_clearance=kzaloIIty5FAsMH_22rmi5OCWqCcnJO1qecwy8rnHJ4-1758951366-1.2.1.1-QfLYoBIa3ekbY_dJmtdna2U5FUiFXVXpcIaNVwLJiELzAftRek4nZ5Lu.kh.ancUFxImflVftwY.0IvVtKn0h.EtmKo2RxeYJ_QU6N4Qr2mxjJ5dd2NFenlrPEbvbjCTsV9eHYnvYNRArjOOXbq8GH7eKXvfU4OHSWzfqEgYG3t.akbPcEX_Ni1jw_qz6H1Wkeanx8EdJ_PIUvXQjXF1dmijaR9epjTQk9_vKpwnuYE",
        },
      }
    );

    const url = fetchVideoUrl(data);
    if (!url) {
      return c.text("Video URL not found", 404);
    }

    const response = await fetch(url);

    if (!response.ok) {
      return c.text(`Remote fetch failed: ${response.status}`, 502);
    }
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
