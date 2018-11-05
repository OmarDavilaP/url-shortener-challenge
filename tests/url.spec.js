
const server = require('../server/server');
const { generateHash, getUrl } = require('../app/url/url');
const router = require('../app/url/routes');
const request = require('supertest')
const { models } = require('../server/mongodb');



describe('Test duplicate URL ', () => {
    beforeEach(async () => {
        await models.Url.collection.insertMany([
            {
                "url": "https://www.google.com/myStuff",
                "protocol": "https:",
                "domain": "google.com",
                "path": "/",
                "hash": "123test",
                "removeToken": "456test",
                "isCustom": false,
                "active": true,
                "visit": 0
            }
        ]);
    });
    afterEach(async () => {
        await models.Url.remove({ hash: '123test' })
    });
    it('Should dont allow duplicated', async () => {


        //insder second document to provoke the issue
        const res = await request(server).post('/').send({
            "url": "https://www.google.com/myStuff",
            "protocol": "https:",
            "domain": "google.com",
            "path": "/",
            "isCustom": false,
            "active": true
        }).expect(500);

    });
})

describe('API should delete document by remove token', () => {
    beforeEach(async () => {
        await models.Url.collection.insertMany([
            {
                "url": "https://www.google.com/myStuff",
                "protocol": "https:",
                "domain": "google.com",
                "path": "/",
                "hash": "123test",
                "removeToken": "456test",
                "isCustom": false,
                "active": true,
                "visit": 0
            }
        ]);
    });

    afterEach(async () => {
        await models.Url.remove({ hash: '123test' })
    });

    it('Should return 200 when delete by removeToken', () => {
        request(server).delete(`/123test/remove/456test`).expect(200).then(res => console.log("Url removed"));

    });
});


describe('Test URL functions', () => {

    /** 
     * Generate 10 values unique values for the same URL,
     *  altought in application duplicated URLs are not allowed
     */
    let url = "www.google.com";
    let result = [];
    for (let i = 0; i < 10; i++) {
        result.push(generateHash(url));
    }
    const uniqueValues = Array.from(new Set(result));

    it('Should generate a short ID unique', () => {
        expect(uniqueValues.length).toBe(10);
    });
    it('Should generate a short ID of 6 characters', () => {
        expect(uniqueValues[0].length).toBe(6);
    });
});

