import {CognitoUserPoolTriggerHandler} from 'aws-lambda';
import {InvalidCodeError, Tokenchannel} from 'tokenchannel';

const apiKey = process.env.TOKENCHANNEL_API_KEY;
const client = new Tokenchannel(apiKey!);

const TC_ERROR_START_NEW_CHALLENGE = 'TC-StartNewChallenge';

export const handler: CognitoUserPoolTriggerHandler = async event => {

    // console.log('privateChallengeParameters: ', event.request.privateChallengeParameters);

    const challengeId = event.request.privateChallengeParameters!.challengeId;
    const challengeAnswer = event.request.challengeAnswer!;

    if (!challengeId || !challengeAnswer) {
        throw new Error(TC_ERROR_START_NEW_CHALLENGE);
    }

    try {
        await client.authenticate(challengeId, challengeAnswer);
        event.response.answerCorrect = true;
    } catch (e) {
        if (!(e instanceof InvalidCodeError)) {
            // Invalidates Session - Need to create new challenge
            console.log('TokenChannel Error: ', e);
            throw e;
        }
    }

    // console.log('Verify Event: ', event);
    return event;
};
