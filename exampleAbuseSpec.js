var expect  = require("chai").expect;
var request = require('superagent');
const agent = request.agent();

var adminUsername = "admin@juice-sh.op";
var adminPass = "admin123";

var authToken='';

var url = "http://localhost:3000";

function getRandomInt(max) {
  return Math.floor(Math.random() * Math.floor(max));
}

describe("Exercise Authenticated Use Cases", function() {
  beforeEach(function(done) {
    agent
      .post(url + '/rest/user/login')
      .set('Content-Type', 'application/json;charset=utf-8')
      .send({email: adminUsername, password: adminPass})
          
      .end(function(error, response){
        expect(response.status).to.equal(200);
        authToken = response.body['authentication']['token'];

        done();
          
      });
          
    });
    it("Account names should be HTML-entity encoded", function(done) {
        this.timeout(4000)
        //create user account
        var tmpAgent = request.agent();
        var testEmail = "der<script>alert(1)</script>py" + getRandomInt(10000) + "@mcfuggles.local"
        var postData = "{\"email\":\"" + testEmail + "\",\"password\":\"password1\",\"passwordRepeat\":\"password1\",\"securityQuestion\":{\"id\":2,\"question\":\"Mother's maiden name?\",\"createdAt\":\"2018-01-10T03:27:48.409Z\",\"updatedAt\":\"2018-01-10T03:27:48.409Z\"},\"securityAnswer\":\"test\"}"
        tmpAgent
          .post(url+'/api/Users/')
          .set('Content-Type', 'application/json;charset=utf-8')
          
          .send(postData)
          .end(function(error, response, body) {
            expect(response.status).to.equal(201);
            agent.set('Authorization','Bearer ' + authToken)
            agent.set('Cookie','token=' + authToken)
            agent.get(url+'/rest/user/authentication-details/', function(error, response, body) {
              expect(response.status).to.equal(200);
              expect(JSON.stringify(response.body)).to.not.contain('"email":"' + testEmail + '"');
              done();
            });
          });
      
      
    });
    it("Ratings must be between 1 and 5, inclusive", function(done) {
      this.timeout(4000)
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
            .send({"UserId":1,"rating":0,"comment":"test","captcha":captchaanswer,"captchaId":captchaid})
            .end(function(error, response, body) {
              expect(response.status).to.equal(400)
              done();
          });
        });
    });
    it("Authenticated adding shopping cart quantity < 0 should fail", function(done) {
      this.timeout(4000)
      agent
        .post(url+'/api/BasketItems/')
        .set('Content-Type', 'application/json;charset=utf-8')
        .send({"ProductId":4,"BasketId":"1","quantity":-99999})
        .end(function(error, response, body) {
          expect(response.status).to.equal(400)
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
});

describe("Exercise Unauthenticated Use Cases", function() {
    it("Unauthenticated users may not modify product descriptions.", function(done) {
      var tmpAgent = request.agent()
      tmpAgent
        .put(url+'/api/Products/1')
        .set('Content-Type', 'application/json;charset=utf-8')
        .send({"description":"The all-time classic."})
        .end(function(error, response, body) {
          expect(response.status).to.equal(403)
          done();
        });
    });
    it("Unauthenticated user leaves feedback as a valid user should prompt for authentication", function(done) {
      var tmpAgent = request.agent()
      tmpAgent
        .post(url+'/api/Feedbacks/')
        .set('Content-Type', 'application/json;charset=utf-8')
        .send({"UserId":1,"rating":0,"comment":"test","captcha":"4","captchaId":1})
        .end(function(error, response, body) {
          expect(response.status).to.equal(401)
          done();
        });
    });
    it("File uploads with html extensions are forbidden", function(done) {
      var tmpAgent = request.agent();
      tmpAgent
        .post(url+'/file-upload')
        .set('Content-Type', 'multipart/form-data; boundary=---------------------------87801712517658189031084039755')
        .send('-----------------------------87801712517658189031084039755\r\nContent-Disposition: form-data; name="file";filename="test.html"\r\nContent-Type: application/pdf\r\n\r\nderp\r\n\r\n-----------------------------87801712517658189031084039755--')
        .end(function(error, response, body) {
          expect(response.status).to.equal(400)
          done();
        });
    });
    it("File uploads larger than 100k are forbidden", function(done) {
      var tmpAgent = request.agent();
      var longFileContents = 'A'.repeat(150000)
      tmpAgent
        .post(url+'/file-upload')
        .set('Content-Type', 'multipart/form-data; boundary=---------------------------87801712517658189031084039755')
        .send('-----------------------------87801712517658189031084039755\r\nContent-Disposition: form-data; name="file";filename="test.pdf"\r\nContent-Type: application/pdf\r\n\r\n' +longFileContents+'\r\n\r\n-----------------------------87801712517658189031084039755--')
        .end(function(error, response, body) {
          expect(response.status).to.equal(400)
          done();
        });
    });
    it("Searching for common SQLi strings should return no data", function(done) {
      request.get(url+'/rest/product/search?q=\';--', function(error,response,body) {
        expect(response.status).to.equal(200)
        expect(response.body).to.equal('{"status":"success","data":[]}')
        done();
      });

    });
    it("Logging in with common SQLi strings in the username should fail", function(done) {
      var tmpAgent = request.agent()
      var sqliString = adminUsername + '\';--'
      tmpAgent
        .post(url + '/rest/user/login')
        .set('Content-Type', 'application/json;charset=utf-8')
        .send({email: sqliString, password: adminPass})
          
        .end(function(error, response){
          expect(response.status).to.not.equal(200);
          done();
          
        });
    });
    it("Unauthenticated adding shopping cart quantity < 0 should prompt for authentication", function(done) {
      var tmpAgent = request.agent()
      tmpAgent
        .post(url+'/api/BasketItems/1')
        .set('Content-Type', 'application/json;charset=utf-8')
        .send({"ProductId":22,"BasketId":"2","quantity":-9999})
        .end(function(error, response, body) {
          expect(response.status).to.equal(401)
          done();
        });
    });
    it("Block access to restricted KeePass file", function(done) {
      var tmpAgent = request.agent()
      tmpAgent
        .redirects(0)
        .get(url+'/ftp/incident-support.kdbx', function(error,response,body) {
          expect(response.status).to.not.equal(200)
          done();
      });

    });
    it("Redirection request outside of whitelisted sites should not redirect", function(done) {
      var tmpAgent = request.agent()
      tmpAgent
        .redirects(0)
        .get(url+'/redirect?to=https://evilsite.local/?extra=https://github.com/bkimminich/juice-shop', function(error,response,body) {
          expect(response.status).to.not.equal(302)
          done();
      });

    });


});
