module.exports={
    server:{
        url: "https://www-lupi.lupi.studio/v1",
        googleLogin: 'https://accounts.google.com/o/oauth2/v2/auth?scope=profile email&access_type=offline&include_granted_scopes=true&state=state_parameter_passthrough_value&redirect_uri=https://api.flashgang.io/v1/googleauth&response_type=code&client_id=979434939914-mmo8birn7i0okdb888crfjej7mpj1q66.apps.googleusercontent.com',
        imageServer: '',
        currency: 'EU',
        roundingRules: '2',
        clientPaymentConditions: '30'
    },
    devServer:{
        url: "https://www-lupi.lupi.studio/v1",
        googleLogin: 'https://accounts.google.com/o/oauth2/v2/auth?scope=profile email&access_type=offline&include_granted_scopes=true&state=state_parameter_passthrough_value&redirect_uri=https://api-dev.flashgang.io/v1/googleauth&response_type=code&client_id=979434939914-mmo8birn7i0okdb888crfjej7mpj1q66.apps.googleusercontent.com',
        imageServer: '',
        currency: 'EU',
        roundingRules: '2',
        clientPaymentConditions: '30'
    },
    local: {
        url: "http://localhost:8080/v1",
        googleLogin: 'https://accounts.google.com/o/oauth2/v2/auth?scope=profile email&access_type=offline&include_granted_scopes=true&state=state_parameter_passthrough_value&redirect_uri=http://localhost:8080/googleauth&response_type=code&client_id=979434939914-mmo8birn7i0okdb888crfjej7mpj1q66.apps.googleusercontent.com',
        imageServer: 'https://www-lupi.lupi.studio/',
        currency: 'EU',
        roundingRules: '2',
        clientPaymentConditions: '30'
        
    },
    getEnvironment: function(url) {
        //console.log("url", url);
        if (url.toLowerCase().indexOf('local')>-1 || url.indexOf('127')>-1) {
        //    console.log("url is ", url, "returning", this.local);
            return this.local;
        } else if (url.toLowerCase().indexOf('dev.flashgang')>-1) {
        //    console.log("url is ", url, "returning", this.devServer);
            return this.devServer;
        } else {
        //    console.log("url is ", url, "returning", this.server);
            return this.server;
        }
    }

}
