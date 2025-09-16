// js/speech.js

const synth = window.speechSynthesis;
let voices = [];

function populateVoiceList() {
    if (typeof speechSynthesis === 'undefined') {
        return;
    }
    voices = synth.getVoices().filter(voice => voice.lang.startsWith('pl'));
}

populateVoiceList();
if (typeof speechSynthesis !== 'undefined' && speechSynthesis.onvoiceschanged !== undefined) {
    speechSynthesis.onvoiceschanged = populateVoiceList;
}

function speak(text) {
    if (synth.speaking) {
        console.error('speechSynthesis.speaking');
        return;
    }
    if (text !== '') {
        const utterThis = new SpeechSynthesisUtterance(text);
        utterThis.onend = function (event) {
            console.log('SpeechSynthesisUtterance.onend');
        }
        utterThis.onerror = function (event) {
            console.error('SpeechSynthesisUtterance.onerror');
        }
        
        // Выбираем польский голос, если он есть
        const polishVoice = voices.find(voice => voice.lang === 'pl-PL');
        if (polishVoice) {
            utterThis.voice = polishVoice;
        } else {
            // Если нет, используем голос по умолчанию
            console.warn("Polish voice not found. Using default.");
        }
        
        synth.speak(utterThis);
    }
}