import {CognitoUserPoolTriggerHandler} from 'aws-lambda';
import {Channel, Charset, IChallengeOptions, Tokenchannel} from 'tokenchannel';

const availableChannelsForPhoneNumberIdentifiers = ['whatsapp', 'voice', 'sms'];

const apiKey = process.env.TOKENCHANNEL_API_KEY;
const defaultChannel = process.env.TOKENCHANNEL_CHANNEL; // One of availableChannelsForPhoneNumberIdentifiers
const defaultLanguage = process.env.TOKENCHANNEL_LANGUAGE; // See https://api.tokenchannel.io/languages
const testMode = process.env.TOKENCHANNEL_TEST_MODE || "false";

const client = new Tokenchannel(apiKey!);
let options: IChallengeOptions = {
    language: defaultLanguage!,
    codeLength: 6,
    expirationInMinutes: 3,
    charset: Charset.DEC,
    maxAttempts: 3,
    test: testMode.toLowerCase() === 'true'
};
export const handler: CognitoUserPoolTriggerHandler = async event => {

    let challengeId: string;

    const channel = selectChannel(event.request.userAttributes['custom:channel']);
    const lang = await selectLanguage(event.request.userAttributes.locale!);

    if (!event.request.session || !event.request.session.length) {

        // New auth session -> Request TokenChannel challenge creation
        try {
            const identifier = event.request.userAttributes.phone_number;
            options = {...options, language: lang!};
            const {requestId} = await client.challenge(channel, identifier, options);
            challengeId = requestId;
        } catch (e: any) {
            // TokenChannel error descriptor.
            throw e;
        }
    } else {

        // Already a session in the request -> Don't generate new TC challenge.
        const previousChallenge = event.request.session.slice(-1)[0];
        challengeId = previousChallenge.challengeMetadata!;
    }

    const createdAt = new Date();
    const expiresAt = new Date(createdAt.getTime() + options.expirationInMinutes! * 60000);

    // Displayed to the Client
    event.response.publicChallengeParameters = {
        challengeId: challengeId,
        identifier: event.request.userAttributes.phone_number,
        channel: channel,
        maxAttempts: "" + options.maxAttempts,
        language: options.language,
        createdAt: createdAt.toISOString(),
        expiresAt: expiresAt.toISOString()
    };

    // Accessible to "Verify Auth Challenge Response" trigger
    event.response.privateChallengeParameters = {
        challengeId: challengeId
    };

    // Added to the session so it is available in a next invocation of the "Create Auth Challenge" trigger
    event.response.challengeMetadata = `${challengeId}`;

    // console.log('CreateAuth - Event: ', event);
    return event;
};

export const selectChannel = (channelString: string | undefined) => {
    if (!!channelString && availableChannelsForPhoneNumberIdentifiers.some(c => c === channelString)) {
        return <Channel>channelString;
    } else {
        return <Channel>defaultChannel;
    }
};

export const selectLanguage = async (langString: string | undefined) => {
    try {
        const availableLanguages = await client.getSupportedLanguages();
        if (!!langString && availableLanguages.some(c => c === langString)) {
            return langString;
        } else {
            return defaultLanguage;
        }
    } catch (e) {
        return defaultLanguage;
    }
};
