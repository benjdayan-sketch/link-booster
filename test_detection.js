
function detectLanguage(text, title = "") {
    const sample = (text + " " + title);
    console.log(`Checking sample: "${sample}"`);

    const configs = [
        { test: /[\u0590-\u05FF]/, msg: "Hebrew", rtl: true },
        { test: /[\u0600-\u06FF\u0750-\u077F]/, msg: "Arabic", rtl: true },
        { test: /[áéíóúñÁÉÍÓÚÑüÜ¡¿]/, msg: "Spanish", rtl: false }
    ];

    for (const config of configs) {
        if (config.test.test(sample)) {
            return config.msg;
        }
    }
    return "English";
}

// Scenarios to test
const tests = [
    { text: "http://example.com/שלום", title: "English Title", expected: "Hebrew" },
    { text: "http://example.com/path", title: "כותרת בעברית", expected: "Hebrew" },
    { text: "http://example.com/path", title: "English Title", expected: "English" },
    { text: "http://example.com/encoded/%D7%A9%D7%9C%D7%95%D7%9D", title: "English", expected: "English" }, // Encoded URL, English Title -> English (Logic expects decoded input)
    { text: decodeURIComponent("http://example.com/encoded/%D7%A9%D7%9C%D7%95%D7%9D"), title: "English", expected: "Hebrew" } // Decoded
];

tests.forEach(t => {
    const result = detectLanguage(t.text, t.title);
    console.log(`Test: ${t.expected === result ? "PASS" : "FAIL"} | Input: [${t.text}, ${t.title}] -> Got: ${result}`);
});
