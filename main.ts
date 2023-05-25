const fs = require("fs");
import { firefox } from "playwright";
import _ from "lodash";

async function main() {
  const browser = await firefox.launch({
    headless: false,
  });

  const page = await browser.newPage();

  await page.goto(
    "https://aovheroes.com/rds/br/rdsd?data=WVRPNFF5K2lneTBUU0QyK2ZNeDJZQ1VTQnhrRUxwU21haVhBelNHWWZ2dHQwT0R5MUJkYm9JRVc2cFVvV3ZpOHRQMkpVdXJnMENCSkxWY3BFeVNTTkc0ekxYRkdQY3UwWGN1M05UblNIK0p3bEFDYkxaQ1Ixd2pHRkZMQnBlSE5WRU5RWk8xalphTUgvTDRlbFYrZmhBPT06Op8OHUN9DXIURXgURHjpA0Y%3D"
  );

  console.log("Waiting for 2 seconds");
  await page.waitForTimeout(2000);

  const title = await page.evaluate(() => {
    return document.querySelector("a.title-chapter")?.textContent;
  });

  const chapters = await page.evaluate(() => {
    interface Opt {
      title: string;
      url: string;
    }
    const options: Opt[] = [];

    document
      .querySelector("select.select-chapter")
      ?.querySelectorAll("option")
      .forEach((opt) => {
        options.push({
          url: "https://summonersky.com" + opt.getAttribute("value"),
          title: opt.textContent!,
        });
      });

    return options.reverse();
  });

  const deduped = chapters.filter((chapt) => {
    // const dupes = [...Array(12).keys()];
    // if (i > 12) {
    //   let noMatch = true;

    //   for (const dupe of dupes) {
    //     if (chapt.title.startsWith(`Chapter ${dupe + 1}:`)) {
    //       noMatch = false;
    //     }
    //   }
    const range = _.range(69, 90);

    console.log(range);

    for (const i of range) {
      console.log(`Chapter ${i}`);
      if (chapt.title.startsWith(`Chapter ${i}`)) {
        return true;
      }
    }

    return false;
  });

  const imageUrls = [];
  for (const chapt of deduped) {
    console.log("Collecting " + chapt.title + "...");
    await page.goto(chapt.url);
    await page.waitForTimeout(1500);
    const chapter = await page.evaluate(() => {
      const items: string[] = [];
      const chapter = document.getElementById("chapter-info")?.textContent;

      document.querySelectorAll(".carousel-item").forEach((item) => {
        if (item.children.length === 1) {
          items.push(item.children[0].getAttribute("data-src")!);
        }
      });

      const config = {
        chapter: chapter,
        items: items,
      };

      return config;
    });

    imageUrls.push(...chapter.items);
  }

  const dir = title;
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir);
  }

  for (const [i, page] of imageUrls.entries()) {
    try {
      const res = await fetch(page);

      if (res.status !== 200) {
        throw new Error("Something went wrong connecting to page " + (i + 1));
      }

      const image = await res.arrayBuffer();

      const zeroIfied = ("00000" + (i + 1)).slice(-5);
      fs.writeFileSync(`${dir}/${zeroIfied}.jpeg`, Buffer.from(image));
    } catch (error) {
      console.error(error);
    }
  }

  await browser.close();
}

main()
  .then(() => console.log("Done"))
  .catch((e) => console.error(e));
