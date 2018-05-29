var expect  = require("chai").expect;
var request = require('superagent');
const agent = request.agent();

var adminUsername = "admin@juice-sh.op";
var adminPass = "admin123";

var authToken='';

var url = "http://127.0.0.1:3000";

function getRandomInt(max) {
  return Math.floor(Math.random() * Math.floor(max));
}

describe("Exercise Administrator Authenticated Use Cases", function() {
  beforeEach(function(done) {
  this.timeout(10000)
    agent
          .post(url + '/rest/user/login')
          .set('Content-Type', 'application/json;charset=utf-8')
          .send({email: adminUsername, password: adminPass})
          
          .end(function(error, response){
            expect(response.status).to.equal(200);
            authToken = response.body['authentication']['token'];
            agent.set('Authorization','Bearer ' + authToken)
            agent.set('Cookie','token=' + authToken)
            done();
          
          });
          
    });
    it("Administrators may view email addresses for all users", function(done) {
        this.timeout(10000)
        //create user account
        var tmpAgent = request.agent();
        var testEmail = "derpy" + getRandomInt(10000) + "@mcfuggles.local"
        var postData = "{\"email\":\"" + testEmail + "\",\"password\":\"password1\",\"passwordRepeat\":\"password1\",\"securityQuestion\":{\"id\":2,\"question\":\"Mother's maiden name?\",\"createdAt\":\"2018-01-10T03:27:48.409Z\",\"updatedAt\":\"2018-01-10T03:27:48.409Z\"},\"securityAnswer\":\"test\"}"
        tmpAgent
          .post(url+'/api/Users/')
          .set('Content-Type', 'application/json;charset=utf-8')
          .send(postData)
          .end(function(error, response, body) {
            expect(response.status).to.equal(201);

            agent.get(url+'/rest/user/authentication-details/', function(error, response, body) {
              expect(response.status).to.equal(200);
              expect(JSON.stringify(response.body)).to.contain('"email":"' + testEmail + '"');
              done();
            });
          });
      
      
    });
    it("Authenticated adding shopping cart quantity 2", function(done) {
      this.timeout(4000)
      agent
        .post(url+'/api/BasketItems/')
        .set('Content-Type', 'application/json;charset=utf-8')
        .send({"ProductId":5,"BasketId":"1","quantity":2})
        .end(function(error, response, body) {
          expect(response.status).to.equal(201)
          agent
            .post(url+'/rest/basket/1/checkout')
            .set('Content-Type', 'application/json;charset=utf-8')
            .send()
            .end(function(error, response, body) {
              expect(response.status).to.equal(200)
              done();
          });
        });
    });
    it("Authenticated users may leave feedback", function(done) {
      var tmpAgent = request.agent();
      tmpAgent
        .set('Content-Type', 'application/json;charset=utf-8')
        .get(url+'/rest/captcha/', function(error, response, body) {
          expect(response.status).to.equal(200);
          var captchaid=response.body['captchaId'];
          var captchaanswer=response.body['answer'];  
          agent
            .post(url+'/api/Feedbacks/')
            .set('Content-Type', 'application/json;charset=utf-8')
            .send({"UserId":1,"rating":5,"comment":"test","captcha":captchaanswer,"captchaId":captchaid})
            .end(function(error, response, body) {
              expect(response.status).to.equal(201)
              done();
          });
        });
    });
    it("Administrators may modify product descriptions.", function(done) {
      this.timeout(10000)
      agent
        .put(url+'/api/Products/1')
        .set('Content-Type', 'application/json;charset=utf-8')
        .send({"description":"The all-time classic."})
        .end(function(error, response, body) {
          expect(response.status).to.equal(200)
          done();
        });
    });
    it("Users may check the contents of their own shopping cart.", function(done) {
      agent.get(url+'/rest/basket/1', function(error, response, body) {
        expect(response.status).to.equal(200);
        done();
      });
    }); 
});

describe("Exercise Unauthenticated Use Cases", function() {
    it("Unauthenticated users may leave feedback with ratings between 1 and 5 (max).", function(done) {
      var tmpAgent = request.agent();
      tmpAgent
        .set('Content-Type', 'application/json;charset=utf-8')
        .get(url+'/rest/captcha/', function(error, response, body) {
          expect(response.status).to.equal(200);
          var captchaid=response.body['captchaId'];
          var captchaanswer=response.body['answer'];  
          agent
            .post(url+'/api/Feedbacks/')
            .set('Content-Type', 'application/json;charset=utf-8')
            .send({"rating":5,"comment":"test","captcha":captchaanswer,"captchaId":captchaid})
            .end(function(error, response, body) {
              expect(response.status).to.equal(201)
              done();
          });
        });
    });
    it("Unauthenticated users may leave feedback with ratings between 1 and 5 (min).", function(done) {
      var tmpAgent = request.agent();
      tmpAgent
        .set('Content-Type', 'application/json;charset=utf-8')
        .get(url+'/rest/captcha/', function(error, response, body) {
          expect(response.status).to.equal(200);
          var captchaid=response.body['captchaId'];
          var captchaanswer=response.body['answer'];  
          agent
            .post(url+'/api/Feedbacks/')
            .set('Content-Type', 'application/json;charset=utf-8')
            .send({"rating":1,"comment":"test","captcha":captchaanswer,"captchaId":captchaid})
            .end(function(error, response, body) {
              expect(response.status).to.equal(201)
              done();
          });
        });
    });

    it("Unauthenticated users may read product information", function(done) {
      request.get(url+'/api/Products/1', function(error, response, body) {
        expect(response.status).to.equal(200)
        done();
      });
    });
    it("Unauthenticated users may upload pdfs < 100k in size", function(done) {
      var tmpAgent = request.agent();
      tmpAgent
        .post(url+'/file-upload')
        .set('Content-Type', 'multipart/form-data; boundary=---------------------------87801712517658189031084039755')
        .send('-----------------------------87801712517658189031084039755\r\nContent-Disposition: form-data; name="file";filename="test.pdf"\r\nContent-Type: application/pdf\r\n\r\nderp\r\n\r\n-----------------------------87801712517658189031084039755--')
        .end(function(error, response, body) {
          expect(response.status).to.equal(204)
          done();
      });
    });
});
