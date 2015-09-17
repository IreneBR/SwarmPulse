$(document)
		.ready(
				function() {
					var counter = 0;
					var data = [];
					var map = L.map('map', {
						zoomControl : false
					}).setView([ 47.379977, 8.545751 ], 2);
					var current_layer = 0;
					var last_layer = 0;
					
					var lightMarkers = new L.LayerGroup();
					var noiseMarkers = new L.LayerGroup();
					var msgMarkers = new L.LayerGroup();
					
					
					new L.Control.Zoom({
						position : 'topright'
					}).addTo(map);
					
					
					var mapNoLabels = L
					.tileLayer(
							'https://cartocdn_{s}.global.ssl.fastly.net/base-midnight/{z}/{x}/{y}.png',
							{
								attribution : '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, &copy; <a href="http://cartodb.com/attributions">CartoDB</a>',
								maxZoom : 22
							});
					
					

					var mapWithLabels = L
							.tileLayer(
									'http://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}.png',
									{
										attribution : '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, &copy; <a href="http://cartodb.com/attributions">CartoDB</a>',
										maxZoom : 22
									});

//					var mapNoLabels = L
//							.tileLayer(
//									'https://cartodb-basemaps-{s}.global.ssl.fastly.net/dark_nolabels/{z}/{x}/{y}.png',
//									{
//										attribution : '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, &copy; <a href="http://cartodb.com/attributions">CartoDB</a>',
//										maxZoom : 22
//									});


					var baseMaps = {		
								"Hide Labels" : mapNoLabels,
								"Show Labels" : mapWithLabels							
					};

					
					var groupedOverlays = {
							"Overlays":{
									    "Light": lightMarkers,
									    "Noise": noiseMarkers,
										"Messages": msgMarkers
										  
									}
							};

					
					var options = { exclusiveGroups: ["Overlays"],groupCheckboxes: true  };			

					var layerControl = L.control.groupedLayers(baseMaps, groupedOverlays, options);
					

					map.addControl(layerControl);
					
					
					
					/***************OverlappingMarkerSpiderfier-Leaflet********************/
					var oms = new OverlappingMarkerSpiderfier(map);
					var popup = new L.Popup();
					oms.addListener('click', function(marker) {
					  popup.setContent(marker.desc);
					  popup.setLatLng(marker.getLatLng());
					  map.openPopup(popup);
					});
					oms.addListener('spiderfy', function(markers) {
						  map.closePopup();
						})
					
					/***************OverlappingMarkerSpiderfier-Leaflet********************/

					/***********************************/
					/** ****Pulse Logo****** */
					var info = L.control({
						position : 'topleft'
					});

					info.onAdd = function(map) {
						this._div = L.DomUtil.create('div', 'info'); 
						this.update();
						return this._div;
					};

					// method that we will use to update the control based on
					// feature properties passed
					info.update = function(props) {
						this._div.style.fontSize = "80%"
						this._div.innerHTML = '<img align = "left" src=\'pulse_logo.png\' width=\'115px\' height=\'10%\' bgcolor=\'#FFFFFF\' > <p width=\'20%\' align: \'bottom\'  style=\'color: #FFA500; display:inline-block; vertical-align: -7px;\'> <i>powered by NervousNet</p><br>';
						this._div.innerHTML += '<a align = "left" href=\'Pulse.apk\'> <p width=\'20%\' align: \'center\'  style=\'color: #E9E9E9; display:inline-block; vertical-align: -7px; textSize: 10px\'> <i>Download Mobile App</p><br>';

					};

					info.addTo(map);

					/** ******************************* */

					/** *****Legend for Color levels for noise***** */
					var legendSound = L.control({
						position : 'bottomleft'
					});

					legendSound.onAdd = function(map) {

						var div = L.DomUtil.create('div', 'label');
						grades = [ 0, 10, 30, 50, 70, 100, 120, 140 ],
								labels = [ "  0-10  ", "10-30", "30-50",
										"50-70", "70-100", "100-120",
										"120-140", "   140+  " ];
						
						div.style.border = "1px solid #ffffff";
						div.style.borderRadius = "2px";
						div.style.backgroundColor = "#2A2A2A";
						div.style.color = "#ffffff";
						div.style.fontSize = "70%";
						div.innerHTML = '<p align: \'bottom\'  style=\'color: #FFFFFF;   display:inline-block;\'> Sound Level (db)</p>  <br>';

						for (var i = 0; i < grades.length; i++) {

							div.innerHTML += '<img align = "left"  width=\'10px\' height=\'10px\' style="background-color:'
									+ getNoiseColor(grades[i] + 1)
									+ '"> <p align: \'left\' style=\'color: #FFA500; display:inline-block; \'>'
									+ labels[i] + ' </p><br>';

						}

						
						return div;
					};
					/** ********** */

					/** *****Legend for showing Light label***** */
					var legendLight = L.control({
						position : 'bottomleft'
					});

					legendLight.onAdd = function(map) {

						var div = L.DomUtil.create('div', 'label');
						var lightGrades = [ 0, 1, 5, 10, 100, 1000, 10000,
								100000 ];
						var lightLabels = [ "0", "1-5", "5-10", "10-100",
								"100-1000", "1000-10000", " 10000-100000 ",
								"100000+" ];

						div.style.border = "1px solid #ffffff";
						div.style.borderRadius = "2px";
						div.style.backgroundColor = "#2A2A2A";
						div.style.color = "#ffffff";
						div.style.fontSize = "70%";
						div.innerHTML = '<p align: \'bottom\'  style=\'color: #FFFFFF;   display:inline-block;\'> Light Level (lux)</p>  <br>';

						for (var i = 0; i < lightGrades.length; i++) {

							div.innerHTML += '<img align = "left"  width=\'10px\' height=\'10px\' style="background-color:'
									+ getLightColor(lightGrades[i] + 1)
									+ '"> <p align: \'left\' style=\'color: #FFA500; display:inline-block; \'>'
									+ lightLabels[i] + ' </p><br>';

						}
						return div;
					};
					
					/******************************/
					/*************Server Connected Status Button*****************/
					var conButton = L.easyButton( {
						  states:[
						          {
						            stateName: 'disconnected',
						            icon: 'fa-chain-broken',
						            title: 'Server disconnected',
						            onClick: function(control){
						              control.state("connecting");
						              doConnect();
						            }
						          }, {
						            stateName: 'connecting',
						            icon: 'fa-spinner fa-spin',
						            title: 'connecting...'
						          }, {
						            stateName: 'connected',
						            icon: 'fa-chain',
						            title: 'Server Connected'
						          }, {
						            stateName: 'error',
						            icon: 'fa-exclamation-circle',
						            title: 'Error.'
						          }
						        ]
						      });
					
					conButton.addTo(map);
					conButton.state('connecting');
					
					
					/******************************/
					
					

					/** ********** */


					mapNoLabels.addTo(map);
//					legendLight.addTo(map);



					map.on('overlayadd', function(a) {
						if (a.name == "Light" && current_layer != 0) {
							current_layer = 0;
							resetToLightReadings();
							last_layer = 0;
						} else if (a.name == "Noise"  && current_layer != 1) {
							current_layer = 1;
							resetToNoiseReadings();
							last_layer = 1;
						} else if (a.name == "Messages"  && current_layer != 2) {
							current_layer = 2;
							resetToMessagesOverlay();
							last_layer = 2;
						}
					});


					function resetToLightReadings() {
						removeAllMarkers();
						lightMarkers.addLayer(markersCluster);
						map.addLayer(lightMarkers);
						legendLight.addTo(map);
						if(last_layer == 1)
							legendSound.removeFrom(map);
					}

					function resetToNoiseReadings() {
						removeAllMarkers();
						noiseMarkers.addLayer(markersCluster);
						map.addLayer(noiseMarkers);
						legendSound.addTo(map);
						if(last_layer == 0)
							legendLight.removeFrom(map);
					}
					
					function resetToMessagesOverlay() {
						removeAllMarkers();
						msgMarkers.addLayer(markersCluster);
						map.addLayer(msgMarkers);
						if(last_layer == 1)
							legendSound.removeFrom(map);
						else if(last_layer == 0)
							legendLight.removeFrom(map);
				
					}

					function removeAllMarkers() {

						markerArray = new Array();

						markersCluster.clearLayers();
						lightMarkers.clearLayers();
						noiseMarkers.clearLayers();
						msgMarkers.clearLayers();
						map.removeLayer(lightMarkers);
						map.removeLayer(noiseMarkers);
						map.removeLayer(msgMarkers);
						counter = 0;
					}


					/********************/

					function getNoiseColor(d) {
						return d > 140 ? '#800026' : d > 120 ? '#BD0026'
								: d > 100 ? '#E31A1C' : d > 70 ? '#FC4E2A'
										: d > 50 ? '#FD8D3C'
												: d > 30 ? '#FEB24C'
														: d > 10 ? '#FED976'
																: '#FFEDA0';
					}

					function getLightColor(d) {
						return d > 100000 ? '#FFFFFF' : d > 10000 ? '#DADFA2'
								: d > 1000 ? '#BBBF8C' : d > 100 ? '#9C9F77'
										: d > 10 ? '#7D8061'
												: d > 5 ? '#5E604C'
														: d > 0 ? '#3F4036'
																: '#212121';
					}

					function getInnerColor(type) {

						if (type == 0) {
							return '#FFC690';
						} else if (type == 1) {
							return '#1A6A34';
						} else if (type == 2) {
							return '#3A6A34';
						}
					}
					

					var markersCluster = new L.MarkerClusterGroup(
							{
								iconCreateFunction : function(cluster) {

									var markers = cluster.getAllChildMarkers();
									var markersCount = markers.length;
									var width = 0;
									var height = 0;
									
									if (markersCount < 10) {
										width = 15;
										height = 15;
									} else if (markersCount < 1000) {
										width = 20;
										height = 20;
									} else if (markersCount < 10000) {
										width = 25;
										height = 25;
									} else {
										width = 30;
										height = 30;
									}

									var bgColor = getMarkerClusterColor(cluster
											.getAllChildMarkers());

									return new L.DivIcon(
											{
												html : '<div style = "width:'
														+ width
														+ 'px; height:'
														+ height
														+ 'px; border-radius:50%; font-size:10px; color:#000; line-height: '
														+ height
														+ 'px; text-align:center; background:'
														+ bgColor
														+ '">'
														+ cluster
																.getChildCount()
														+ '</div>',
														
												className: 'cluster',
												iconSize: L.point(0,0)
											});
								},
								disableClusteringAtZoom : 10,
								maxClusterRadius:10,
								showCoverageOnHover:true
							});


					function getMarkerClusterColor(markers) {
						var sum;
						var lightLayerFlag;
						for (var i = 0; i < markers.length; i++) {
							if (i == 0) {
								if (markers[i].options.type == 0)
									lightLayerFlag = true
								else
									lightLayerFlag = false;
							}

							sum = markers[i].options.value;
						}
						var avg = sum / markers.length;

						if (lightLayerFlag)
							return getLightColor(avg);
						else
							return getNoiseColor(avg);
					}
					;

					lightMarkers.addLayer(markersCluster);

					var markerArray = [];
					function addMarker(msg, geojsonMarkerOptions) {
						counter++;
						var d = new Date();
						if (msg.properties.readingType == 0
								&& current_layer == 0) {
							var lightMarker = L.circleMarker(
									msg.geometry.coordinates,
									geojsonMarkerOptions);

							lightMarker.bindPopup(
									'<p style="color:black" align="center"><strong>'
											+ msg.properties.level
											+ '</strong> lux', {
										closeButton : false,
										offset : L.point(0, -5)
									});

							lightMarker.on('mouseover', function() {
								lightMarker.openPopup();
							});
							lightMarker.on('mouseout', function() {
								lightMarker.closePopup();
							});

							
//							markersCluster
//									.bindPopup(
//											'<p style="color:black" ><strong> MARKER CLUSTER</strong> db',
//											{
//												closeButton : false,
//												offset : L.point(0, -5)
//											});
													
							markerArray.push(lightMarker);
							markersCluster.addLayer(lightMarker);
							oms.addMarker(lightMarker);
							lightMarker.openPopup();
							
						} else if (msg.properties.readingType == 1
								&& current_layer == 1) {
							var noiseMarker = L.circleMarker(
									msg.geometry.coordinates,
									geojsonMarkerOptions);
							noiseMarker.bindPopup(
									'<p style="color:black"  ><strong>'
											+ msg.properties.level
											+ '</strong> db', {
										closeButton : false,
										offset : L.point(0, -5)
									});
							
							
								noiseMarker.on('mouseover', function() {
									noiseMarker.openPopup();
								});
								noiseMarker.on('mouseout', function() {
									noiseMarker.closePopup();
								});
							
							markerArray.push(noiseMarker);
							markersCluster.addLayer(noiseMarker);
							oms.addMarker(noiseMarker);
							noiseMarker.openPopup();
							
						} else if (msg.properties.readingType == 2 && current_layer == 2) {
							var msgMarker = L.circleMarker(
									msg.geometry.coordinates,
									geojsonMarkerOptions);
							
							msgMarker.bindPopup(
									'<p style="color:black" align="center"><strong>'
											+ replaceURLWithHTMLLinks(msg.properties.message)
											+ '</strong>', {
										closeButton : false,
										offset : L.point(0, -5)
									});
							
							
								msgMarker.on('mouseover', function() {
									msgMarker.openPopup();
								});
								msgMarker.on('mouseout', function() {
									msgMarker.closePopup();
								});
						
							
							markerArray.push(msgMarker);
							markersCluster.addLayer(msgMarker);
							oms.addMarker(msgMarker);
							msgMarker.openPopup();
						}
					}
					;
					
					function replaceURLWithHTMLLinks(text)
				    {
				      var exp = /(\b(https?|ftp|file|http):\/\/[-A-Z0-9+&@#\/%?=~_|!:,.;]*[-A-Z0-9+&@#\/%=~_|])/ig;
				      return text.replace(exp,"<a href='$1'>$1</a>"); 
				    }

					function getOuterColor(type, d) {

						if (type == 0) {
							return d > 200 ? '#1A6A34' : d > 100 ? '#8CBD31'
									: d > 70 ? '#FEDE00' : d > 50 ? '#FFDB4E'
											: d > 25 ? '#E88A3C'
													: d > 1 ? '#FF4A47'
															: '#FF4A47';
						} else if (type == 1) {
							return d > 70 ? '#1A6A34' : d > 60 ? '#8CBD31'
									: d > 40 ? '#FEDE00' : d > 20 ? '#FFDB4E'
											: d > 10 ? '#E88A3C'
													: d > 1 ? '#FF4A47'
															: '#FF4A47';
						} else if (type == 2) {

						}
					}
					;

					/******Update****** */
					
//					var tickerBox = L.Control.extend({
//						options: {
//						position: 'bottomleft'
//						},
//
//					    onAdd: function (map) {
//					    	var div = L.DomUtil.create('div', 'ticker');
//
//					        return div;
//					    }
//					})
//					
//					map.addControl(new tickerBox());

					var box = L.control.messagebox().addTo(map);

					L.control.liveupdate({
						update_map : function() {
							updateMarkerArray();
							box.show('Counter :' + counter);
							console.log('Counter :' + counter);
						},
						position : 'bottomright'
					}).addTo(map).startUpdating();

					function updateMarkerArray() {
						for (var i = 0; i < markerArray.length; i++) {
							var marker = markerArray[i];
							var d = new Date();
							if (d.getTime() - marker.options.startTime >= 30000) {
								
//								markersCluster.removeLayer(marker);

//								markerArray.splice(i, 1);
//								counter--;
							}
						}
					}

					
					/*********Websocket**************/
					
					  function doConnect()
					  {
					    if (window.MozWebSocket)
					    {
					        logToConsole('<span style="color: red;"><strong>Info:</strong> This browser supports WebSocket using the MozWebSocket constructor</span>');
					        window.WebSocket = window.MozWebSocket;
					    }
					    else if (!window.WebSocket)
					    {
					        logToConsole('<span style="color: red;"><strong>Error:</strong> This browser does not have support for WebSocket</span>');
					        return;
					    }

					 
					    websocket = new WebSocket("ws://129.132.255.27:8446");
					    websocket.onopen = function(evt) { onOpen(evt) };
					    websocket.onclose = function(evt) { onClose(evt) };
					    websocket.onmessage = function(evt) { onMessage(evt) };
					    websocket.onerror = function(evt) { onError(evt) };
					  }
					  
					  function doDisconnect()
					  {
					    websocket.close()
					  }
					  
					  function onOpen(evt)
					  {
						  conButton.state('connected');
							// Send an initial message
							socket.send('WebClient Listening!');
					  }

					  function onClose(evt)
					  {
						  console.log('Client notified socket has closed',
									event);
							conButton.state('disconnected');
					  }

					  function onMessage(evt)
					  {
						var msg = JSON.parse(event.data);
						var geojsonMarkerOptions;
						if (msg.properties.readingType == 0)
							geojsonMarkerOptions = {
								radius : 4,
								fillColor : getLightColor(msg.properties.level),
								color : "#FFFFFF",//getLightColor(msg.properties.level),
								weight : 1,
								opacity : 0.7,
								fillOpacity : 0.5,
								type : msg.properties.readingType,
								value : msg.properties.level,
								startTime : new Date().getTime()
							};
						else if (msg.properties.readingType == 1)
							geojsonMarkerOptions = {
								radius : 4,
								fillColor : getNoiseColor(msg.properties.level),
								color : "#FFFFFF",//getNoiseColor(msg.properties.level),
								weight : 1,
								opacity : 0.7,
								fillOpacity : 0.5,
								type : msg.properties.readingType,
								value : msg.properties.level,
								startTime : new Date().getTime()
							};
						else if (msg.properties.readingType == 2)
							geojsonMarkerOptions = {
								radius : 4,
								fillColor : '#FFFFFF',
								color : '#FFFFFF',
								weight : 1,
								opacity : 0.7,
								fillOpacity : 0.5,
								type : msg.properties.readingType,
								value : msg.properties.message,
								startTime : new Date().getTime()
							};

						addMarker(msg, geojsonMarkerOptions);

					  }

					  function onError(evt)
					  {
						  conButton.state('error');
					  }
					
					  doConnect();
//					var socket = new WebSocket("ws://129.132.255.27:8446");
//
//					// Open the socket
//					socket.onopen = function(event) {
//						conButton.state('connected');
//						// Send an initial message
//						socket.send('WebClient Listening!');
//
//						// Listen for messages
//						socket.onmessage = function(event) {
//							var msg = JSON.parse(event.data);
////							console.log("Received Msg - "+JSON.stringify(msg) );
//							var geojsonMarkerOptions;
//							if (msg.properties.readingType == 0)
//								geojsonMarkerOptions = {
//									radius : 4,
//									fillColor : getLightColor(msg.properties.level),
//									color : "#FFFFFF",//getLightColor(msg.properties.level),
//									weight : 1,
//									opacity : 0.7,
//									fillOpacity : 0.5,
//									type : msg.properties.readingType,
//									value : msg.properties.level,
//									startTime : new Date().getTime()
//								};
//							else if (msg.properties.readingType == 1)
//								geojsonMarkerOptions = {
//									radius : 4,
//									fillColor : getNoiseColor(msg.properties.level),
//									color : "#FFFFFF",//getNoiseColor(msg.properties.level),
//									weight : 1,
//									opacity : 0.7,
//									fillOpacity : 0.5,
//									type : msg.properties.readingType,
//									value : msg.properties.level,
//									startTime : new Date().getTime()
//								};
//							else if (msg.properties.readingType == 2)
//								geojsonMarkerOptions = {
//									radius : 4,
//									fillColor : '#FFFFFF',
//									color : '#FFFFFF',
//									weight : 1,
//									opacity : 0.7,
//									fillOpacity : 0.5,
//									type : msg.properties.readingType,
//									value : msg.properties.message,
//									startTime : new Date().getTime()
//								};
//
//							addMarker(msg, geojsonMarkerOptions);
//
//						};
//
//						// Listen for socket closes
//						socket.onclose = function(event) {
//							console.log('Client notified socket has closed',
//									event);
//							conButton.state('disconnected');
//						};
//
//						// To close the socket....
//						// socket.close()
//
//					};
//
//					socket.onerror = function(evt) {
//						conButton.state('error');
//						onError(evt)
//					};
//
//					function onError(evt) {
//						console.log('ERROR ', evt.data);
//					}

					function openPopUp(e) {
						var popup = L.popup().setLatLng(e.latlng).setContent(
								'Light Level = ').openOn(map);
					}

					function closePopUp(e) {
						L.popup().close;
					}

					
					resetToLightReadings();
});