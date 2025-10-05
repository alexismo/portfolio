setup = ->
	
	# Define and set custom device
	Framer.Device.customize
		deviceType: "fullscreen"
		screenWidth: 1122
		screenHeight: 593
	
	Framer.Device.setDeviceScale(1,false)
	
	# Use desktop cursor
	document.body.style.cursor = "auto"
	
# Project Info
	# This info is presented in a widget when you share.
	# http://framerjs.com/docs/#info.info
	
	Framer.Info =
		title: ""
		author: "Alexis Morin"
		twitter: ""
		description: ""

	
	# This imports all the layers for "progress-proto-1778" into progressProto1778Layers1
	protoLayers = Framer.Importer.load "imported"
	
	steps = [5, 91, 177, 263, 349]
	
	blueDot = new Layer x:461, y: 323, width: protoLayers.inner1.width+2, height: protoLayers.inner1.height+2
	blueDot.style = {"backgroundColor":"#35393f", "border-radius":"20px"}
	blueDot.scale = 0
	
	loadingText = new Layer x: 400, y: 375, width:400, height:30
	loadingText.style = {"backgroundColor":"#ecedef", "color":"#35393f", "font-family":"Helvetica, Arial, sans-serif", "font-size":"14px", "text-align":"center"}
	loadingText.html = "Entering student queue"
	
	protoLayers.check1.rotation = 45
	protoLayers.check1.scale = 0
	
	protoLayers.check1.bringToFront()
	
	bar = protoLayers.extentableBlue
	
	until1 = bar.animate
		properties:{width:steps[1]}
		time: 3
	
	until1.on Events.AnimationEnd, ->
		loadingText.html = "Successfully joined student queue"
		
		blueDot.animate
			properties:{scale:1}
			time:0.3
		
		protoLayers.check1.animate
			properties: {scale:1, rotation:0}
			time:0.2
			delay:0.4
		
		Utils.delay(3, step2)
		
	step2  = ()->
		
		loadingText.html = "Preparing virtual classroom"
		
		step21 = bar.animate
			properties:{width:steps[2]-60}
	
	protoLayers.uselessBgCrap.on Events.Click, ->
		Framer.CurrentContext.reset()
		setup()

setup()
