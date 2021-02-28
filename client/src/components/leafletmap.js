import React, { Component } from 'react';
import L from "leaflet";
import {Map, TileLayer,Marker,Popup} from "react-leaflet";
import "leaflet/dist/leaflet.css";
import icon from "leaflet/dist/images/marker-icon.png";
import iconShadow from "leaflet/dist/images/marker-shadow.png";

let DefaultIcon = L.icon({
 iconUrl: icon,
 shadowUrl: iconShadow,
});

L.Marker.prototype.options.icon = DefaultIcon;

export default class leafletmap extends React.Component{
	state = {
		lat: 24.123206 ,
		lng: 120.675679,
		zoom: 15,
	  }


  render() {
	const position = [this.state.lat, this.state.lng]
    return (
      <Map center={position} zoom={this.state.zoom} style={{height: '500px'}}>
        <TileLayer
          attribution='&amp;copy <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <Marker position={position}>
          <Popup>
            中興大學
          </Popup>
        </Marker>
      </Map>
      
    )
  }
}