// Dernière traduction Gaellique GD
var JTerm = {
	basePath : "src",
	controllers : {},
	langs : {
		af: "af.js",
		am : "am.js",
		ar : "ar.js",
		az : "az.js",
		be : "be.js",
		bg : "bg.js",
		bn : "bn.js",
		bs : "bs.js",
		ca : "ca.js",
		ceb : "ceb.js",
		co : "co.js",
		da : "da.js",
		de : "de.js",
		en : "en.js",
		eo : "eo.js",
		es : "es.js",
		et : "et.js",
		eu : "eu.js",
		fi : "fi.js",
		fr : "fr.js",
		"fr-CH" : "fr.js",
		fy : "fy.js",
		gd : "gd.js",
		ht : "ht.js",
		hr : "hr.js",
		hy : "hy.js",
		ko : "ko.js",
		my : "my.js",
		ny : "ny.js",
		si : "si.js",
		sq : "sq.js",
		"zh-CN" : "zh-CN.js",
		"zh-TW" : "zh-TW.js"
		
	}
};

JTerm.create = function(name, options) {
	JTerm.controllers[name] = new JTermController(new JTermView(options.input, options.output));
	return JTerm.controllers[name];	
};

JTerm.addLang = function(lang, file){
	JTerm.langs[lang] = file;
};

JTerm.getLang = function(lang){
	if( typeof JTerm.langs[lang] === "string"){
		JTerm.langs[lang] = new JTermLang(lang, JTerm.basePath+"/langs/"+JTerm.langs[lang]);
	}
	return JTerm.langs[lang];
};