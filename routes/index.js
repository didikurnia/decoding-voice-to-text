const express = require('express');
const router = express.Router();
const speech = require('@google-cloud/speech');
const fs = require("fs");
const wav = require('wav');
// Azure
const sdk = require("microsoft-cognitiveservices-speech-sdk");

/* GET home page. */
router.get('/', (req, res, next) => {
  res.render('index', { title: 'Express' });
});

router.get('/voice-to-text', (req, res, next) => {
  const client = new speech.SpeechClient({
    projectId: 'voice-to-text-386816',
    keyFilename: './files/voice-to-text-386816-00d7e067fc1f.json',
  });
    const stereoWavFilePath = './files/audio/sample-audio-files-for-speech-recognition.wav';
    const monoWavFilePath = './files/audio/mono.wav';

    // Convert stereo audio to mono
    const reader = new wav.Reader();
    const writer = new wav.FileWriter(monoWavFilePath, {
        channels: 1,
        sampleRate: 44100, // Adjust to match the desired sample rate
        bitDepth: 16,
    });

    reader.on('data', function (data) {
        writer.write(data);
    });

    reader.on('end', function () {
        writer.end();

        // Perform speech recognition on the mono WAV file
        transcribeAudio(monoWavFilePath);
    });

    fs.createReadStream(stereoWavFilePath).pipe(reader);

    function transcribeAudio(wavFilePath) {
        const request = {
            config: {
                encoding: 'LINEAR16',
                sampleRateHertz: 44100,
                languageCode: 'en-US',
            },
            audio: {
                content: fs.readFileSync(wavFilePath).toString('base64'),
            },
        };

        client.recognize(request)
            .then(data => {
                const results = data[0].results;
                const transcription = results
                    .map(result => result.alternatives[0].transcript)
                    .join('\n');
                res.json({
                    message: 'ok',
                    transcription: transcription
                });
                console.log(`Transcription: ${transcription}`);
            })
            .catch(err => {
                res.json({
                    message: 'ok',
                    error: err
                });
                console.error('Error:', err);
            });
    }
  // const wavFilePath = monoWavFilePath;

  // const request = {
  //   config: {
  //     encoding: 'LINEAR16',
  //     sampleRateHertz: 44100, // 16000,
  //     languageCode: 'en-US',
  //   },
  //   audio: {
  //     content: fs.readFileSync(wavFilePath).toString('base64'),
  //   },
  // };
  // client.recognize(request)
  //     .then(data => {
  //       const results = data[0].results;
  //       const transcription = results
  //           .map(result => result.alternatives[0].transcript)
  //           .join('\n');
  //       console.log(`Transcription: ${transcription}`);
  //       res.json({
  //         message: 'ok',
  //         transcription: transcription
  //       });
  //     })
  //     .catch(err => {
  //       res.json({
  //         message: 'ok',
  //         error: err
  //       });
  //       console.error('Error:', err);
  //     });
});

router.get('/voice-to-text-mono', (req, res, next) => {
    const client = new speech.SpeechClient({
        projectId: 'voice-to-text-386816',
        keyFilename: './files/voice-to-text-386816-00d7e067fc1f.json',
    });

    const wavFilePath = './files/audio/sample-mono-2.wav';

    const request = {
      config: {
        encoding: 'LINEAR16',
        sampleRateHertz: 44100, // 16000,
        languageCode: 'id-ID', // Change to 'id-ID' for Indonesian language
        // languageCode: 'en-US',
      },
      audio: {
        content: fs.readFileSync(wavFilePath).toString('base64'),
      },
    };
    client.recognize(request)
        .then(data => {
          const results = data[0].results;
          const transcription = results
              .map(result => result.alternatives[0].transcript)
              .join('\n');
          console.log(`Transcription: ${transcription}`);
          res.json({
            message: 'ok',
            transcription: transcription
          });
        })
        .catch(err => {
          res.json({
            message: 'ok',
            error: err
          });
          console.error('Error:', err);
        });
});

router.get('/start-azure-voice-to-text', (req, res, next) => {
    // Replace with your Azure Speech resource's subscription key and region
    const subscriptionKey = "06db53b450d84de49bae534d82a95d1e";
    const region = "southeastasia"; // e.g., "westus"

    const speechConfig = sdk.SpeechConfig.fromSubscription(subscriptionKey, region);
    speechConfig.speechRecognitionLanguage = "en-US"; // Replace with your desired language

    const audioConfig = sdk.AudioConfig.fromDefaultMicrophoneInput();

    const recognizer = new sdk.SpeechRecognizer(speechConfig, audioConfig);

    recognizer.recognizing = (_, { result }) => {
        console.log(`Recognizing: ${result.text}`);
    };

    recognizer.recognized = (_, { result }) => {
        console.log(`Recognized: ${result.text}`);
    };

    recognizer.startContinuousRecognitionAsync(() => {
        console.log("Recognition started. Listening for speech...");
    }, (error) => {
        console.error(error);
    });
});

module.exports = router;
