"use client";

import { useEffect, useState } from "react";

const translationCache = new Map<string, string>();

const KNOWN_THAI_TRANSLATIONS: Record<string, string> = {
  "What color is the sky on a sunny day?": "ท้องฟ้าในวันที่แดดออกมีสีอะไร",
  "What color is grass?": "หญ้ามีสีอะไร",
  "What color is a ripe banana?": "กล้วยสุกมีสีอะไร",
  "What color is snow?": "หิมะมีสีอะไร",
  "What color is a fire truck?": "รถดับเพลิงมีสีอะไร",
  "What color is coal?": "ถ่านหินมีสีอะไร",
  "What color is a strawberry?": "สตรอว์เบอร์รีมีสีอะไร",
  "What color is a grape?": "องุ่นมีสีอะไร",
  "What color are leaves in autumn?": "ใบไม้ในฤดูใบไม้ร่วงมีสีอะไร",
  "What color is milk?": "นมมีสีอะไร",
  "What color is the sun?": "ดวงอาทิตย์มีสีอะไร",
  "What color is chocolate?": "ช็อกโกแลตมีสีอะไร",
  "What color is a lemon?": "มะนาวมีสีอะไร",
  "What color are most tree trunks?": "ลำต้นของต้นไม้ส่วนใหญ่มีสีอะไร",
  "What color is a carrot?": "แครอทมีสีอะไร",
  'Which animal says "meow"?': 'สัตว์ชนิดใดร้องว่า "เหมียว"',
  'Which animal says "woof"?': 'สัตว์ชนิดใดร้องว่า "โฮ่ง"',
  "Which animal is the largest land animal?": "สัตว์บกชนิดใดมีขนาดใหญ่ที่สุด",
  "Which animal has a very long neck?": "สัตว์ชนิดใดมีคอยาวมาก",
  "Which animal hops and has long ears?": "สัตว์ชนิดใดกระโดดและมีหูยาว",
  "Which animal can fly?": "สัตว์ชนิดใดบินได้",
  "Which animal has black and white stripes?": "สัตว์ชนิดใดมีลายขาวดำ",
  "Which animal gives us milk?": "สัตว์ชนิดใดให้นมแก่เรา",
  "Which animal has a trunk?": "สัตว์ชนิดใดมีงวง",
  "A baby cat is called a _______.": "ลูกแมวเรียกว่าอะไร",
  "A baby dog is called a _______.": "ลูกสุนัขเรียกว่าอะไร",
  "Which animal lives in water and has fins?": "สัตว์ชนิดใดอาศัยในน้ำและมีครีบ",
  "Which animal lays eggs?": "สัตว์ชนิดใดออกไข่",
  'Which animal is called "man\'s best friend"?':
    'สัตว์ชนิดใดถูกเรียกว่า "เพื่อนที่ดีที่สุดของมนุษย์"',
  "Which animal has a mane around its face?": "สัตว์ชนิดใดมีแผงคอรอบหน้า",
  "How do you write the number 3 in words?":
    "เขียนเลข 3 เป็นคำภาษาอังกฤษอย่างไร",
  "How do you write the number 7 in words?":
    "เขียนเลข 7 เป็นคำภาษาอังกฤษอย่างไร",
  "How do you write the number 10 in words?":
    "เขียนเลข 10 เป็นคำภาษาอังกฤษอย่างไร",
  "How do you write the number 15 in words?":
    "เขียนเลข 15 เป็นคำภาษาอังกฤษอย่างไร",
  "How do you write the number 20 in words?":
    "เขียนเลข 20 เป็นคำภาษาอังกฤษอย่างไร",
  '"Twelve" is the number _______.': '"Twelve" คือเลขอะไร',
  '"First" is used for which position?': '"First" ใช้กับลำดับที่เท่าไร',
  '"Second" is used for which position?': '"Second" ใช้กับลำดับที่เท่าไร',
  '"Third" is used for which position?': '"Third" ใช้กับลำดับที่เท่าไร',
  "How many days are in a week?": "หนึ่งสัปดาห์มีกี่วัน",
  "How many months are in a year?": "หนึ่งปีมีกี่เดือน",
  '"One hundred" is written as _______.':
    '"One hundred" เขียนเป็นตัวเลขอย่างไร',
  'What comes after "nineteen"?': 'อะไรอยู่หลังคำว่า "nineteen"',
  '"Fifty" is half of _______.': '"Fifty" คือครึ่งหนึ่งของอะไร',
  "How many sides does a triangle have?": "รูปสามเหลี่ยมมีกี่ด้าน",
  "What do you drink when you are thirsty?": "คุณดื่มอะไรเมื่อกระหายน้ำ",
  "An _______ a day keeps the doctor away.":
    "กิน _______ วันละหนึ่งผล ช่วยให้ห่างไกลหมอ",
  "You make scrambled _______ for breakfast.": "คุณทำ _______ คนเป็นอาหารเช้า",
  "Many Asian countries eat _______ as a staple food.":
    "หลายประเทศในเอเชียกิน _______ เป็นอาหารหลัก",
  "You spread butter on _______.": "คุณทาเนยบน _______",
  "You add _______ to make food taste sweet.":
    "คุณเติม _______ เพื่อให้อาหารมีรสหวาน",
  "Milk comes from a _______.": "นมมาจาก _______",
  "A _______ is a long yellow fruit.": "_______ เป็นผลไม้ยาวสีเหลือง",
  "Bread is baked in an _______.": "ขนมปังอบใน _______",
  '"Soup" is usually served _______.': '"Soup" มักเสิร์ฟแบบ _______',
  "Pizza and pasta come from _______.": "พิซซ่าและพาสต้ามาจากประเทศ _______",
  "Sushi is a traditional _______ food.": "ซูชิเป็นอาหารดั้งเดิมของ _______",
  "You add _______ to coffee to make it less bitter.":
    "คุณเติม _______ ลงในกาแฟเพื่อลดความขม",
  "Oranges and lemons are types of _______ fruit.":
    "ส้มและเลมอนเป็นผลไม้ตระกูล _______",
  "Fish and chips is a popular dish from _______.":
    "ฟิชแอนด์ชิปส์เป็นอาหารยอดนิยมจาก _______",
  "You wear _______ on your feet.": "คุณสวม _______ ที่เท้า",
  "You wear _______ on your head.": "คุณสวม _______ บนศีรษะ",
  "You wear _______ on your hands in cold weather.":
    "คุณสวม _______ ที่มือเมื่ออากาศหนาว",
  "What do you wear on your legs?": "คุณสวมอะไรที่ขา",
  "A _______ is worn around the neck to keep warm.":
    "สวม _______ รอบคอเพื่อให้ร่างกายอบอุ่น",
  "You wear a _______ when it rains.": "คุณสวม _______ เมื่อฝนตก",
  "You wear _______ inside your shoes.": "คุณสวม _______ ในรองเท้า",
  "A _______ keeps the sun off your face.": "_______ ช่วยบังแดดไม่ให้โดนหน้า",
  "You wear a _______ to a formal event.": "คุณสวม _______ ไปงานทางการ",
  "In hot weather you wear _______ instead of trousers.":
    "เมื่ออากาศร้อน คุณสวม _______ แทนกางเกงขายาว",
  "A _______ is worn over a shirt to keep warm.":
    "สวม _______ ทับเสื้อเพื่อให้ร่างกายอบอุ่น",
  "You wear a _______ to swim.": "คุณสวม _______ เพื่อว่ายน้ำ",
  "A _______ is a formal strip of fabric worn round the neck.":
    "_______ คือผ้าผืนยาวแบบทางการที่สวมรอบคอ",
  "You wear a _______ on your feet for the beach.":
    "คุณสวม _______ ที่เท้าเมื่อไปชายหาด",
  "A _______ keeps your trousers from falling down.":
    "_______ ช่วยไม่ให้กางเกงตก",
  "When the sun shines with no clouds, the weather is _______.":
    "เมื่อดวงอาทิตย์ส่องแสงและไม่มีเมฆ อากาศจะ _______",
  "Water falls from the sky when it is _______.":
    "น้ำตกลงมาจากฟ้าเมื่อ _______",
  "When the sky is covered with clouds, it is _______.":
    "เมื่อท้องฟ้าถูกปกคลุมด้วยเมฆ อากาศจะ _______",
  "In winter, white _______ can fall from the sky.":
    "ในฤดูหนาว _______ สีขาวอาจตกลงมาจากฟ้า",
  "Trees and leaves move when it is _______.":
    "ต้นไม้และใบไม้เคลื่อนไหวเมื่ออากาศ _______",
  "The weather in summer is usually _______.": "อากาศในฤดูร้อนมักจะ _______",
  "The weather in winter is usually _______.": "อากาศในฤดูหนาวมักจะ _______",
  "When it is foggy, it is hard to _______.": "เมื่อมีหมอก จะ _______ ได้ยาก",
  "Lightning and thunder happen during a _______.":
    "ฟ้าแลบและฟ้าร้องเกิดขึ้นระหว่าง _______",
  "You need an umbrella when it is _______.": "คุณต้องการร่มเมื่อ _______",
  "Temperature is measured in _______ or Fahrenheit.":
    "อุณหภูมิวัดเป็น _______ หรือฟาเรนไฮต์",
  "When it is very hot, you should drink plenty of _______.":
    "เมื่ออากาศร้อนมาก คุณควรดื่ม _______ มาก ๆ",
  "A _______ is a very strong tropical storm.":
    "_______ คือพายุเขตร้อนที่รุนแรงมาก",
  "When the air contains a lot of moisture, the weather is _______.":
    "เมื่ออากาศมีความชื้นมาก อากาศจะ _______",
  "A long period with no rain is called a _______.":
    "ช่วงเวลานานที่ไม่มีฝนเรียกว่า _______",
};

function fallbackThaiTranslation(question: string): string {
  const replacements: Array<[string, string]> = [
    ["Choose", "เลือก"],
    ["Which", "ข้อใด"],
    ["Complete", "เติมให้สมบูรณ์"],
    ["Fill in the blank", "เติมคำในช่องว่าง"],
    ["Pick", "เลือก"],
    ["What", "อะไร"],
    ["Is", "คือ"],
    ["the sentence", "ประโยค"],
    ["correct", "ถูกต้อง"],
    ["word", "คำ"],
    ["phrase", "วลี"],
    ["question", "คำถาม"],
  ];

  let translated = question;
  for (const [en, th] of replacements) {
    translated = translated.replace(new RegExp(en, "gi"), th);
  }

  return translated;
}

export function useThaiQuestion(question: string): string {
  const [thaiQuestion, setThaiQuestion] = useState("");
  const knownTranslation = KNOWN_THAI_TRANSLATIONS[question];

  useEffect(() => {
    let cancelled = false;

    if (!question || knownTranslation) return;

    const cached = translationCache.get(question);
    if (cached) return;

    const fetchTranslation = async () => {
      try {
        const response = await fetch(
          `https://api.mymemory.translated.net/get?q=${encodeURIComponent(question)}&langpair=en|th`,
        );
        const data = (await response.json()) as {
          responseData?: { translatedText?: string };
        };

        const translated = data.responseData?.translatedText?.trim();
        const safeTranslated =
          translated && translated.length > 0 && translated !== question
            ? translated
            : fallbackThaiTranslation(question);

        translationCache.set(question, safeTranslated);
        if (!cancelled) {
          setThaiQuestion(safeTranslated);
        }
      } catch {
        const fallback = fallbackThaiTranslation(question);
        translationCache.set(question, fallback);
        if (!cancelled) {
          setThaiQuestion(fallback);
        }
      }
    };

    fetchTranslation();

    return () => {
      cancelled = true;
    };
  }, [knownTranslation, question]);

  if (!question) return "";
  return knownTranslation ?? translationCache.get(question) ?? thaiQuestion;
}
