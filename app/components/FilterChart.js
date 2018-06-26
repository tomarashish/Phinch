import React, { Component } from 'react';
import ReactDOM from 'react-dom';

import Slider, { Range } from 'rc-slider';
import { scaleLinear } from 'd3-scale';

export default class FilterChart extends Component {
  constructor(props) {
    super(props);

    this.state = {
      update: false,
    }

    this.updateFilter = this.updateFilter.bind(this);
  }

  updateScales() {
    this.padding = 0;
    const counts = this.props.data.values.map(d => d.count);
    this.yscale = scaleLinear()
      .domain([0, Math.max(...counts)])
      .range([0, this.props.height - this.padding]);
    this.xscale = scaleLinear()
      .clamp(true)
      .domain([0, this.props.data.values.length])
      .range([this.padding, this.props.width - this.padding]);
  }

  updateFilter(name, values) {
    this.props.update(
      this.props.filters,
      name,
      Math.round(this.xscale.invert(values[0])),
      Math.round(this.xscale.invert(values[1]) - 1),
      this.props.callback,
      );
  }

  render() {
    this.updateScales();
    const isDate = (this.props.name.toLowerCase().includes('date'));
    const barWidth = (this.xscale(1) - this.xscale(0));
    const filter = this.props.filters[this.props.name];
    const bars = this.props.data.values.map((d, i) => {
      const valueInRange = (isDate) ? (          
          !(
            new Date(d.value).valueOf() < new Date(filter.range.min.value).valueOf()
            ||
            new Date(d.value).valueOf() > new Date(filter.range.max.value).valueOf()
          )
        ) : (
          !(
            d.value < filter.range.min.value
            ||
            d.value > filter.range.max.value
          )
        );
      const fillOpacity = valueInRange ? 1 : 0.3;
      return (
        <rect
          key={`r-${i}`}
          x={this.xscale(i)}
          y={this.props.height - (this.yscale(d.count))}
          width={barWidth}
          height={this.yscale(d.count)}
          fill='#2b2b2b'
          fillOpacity={fillOpacity}
          stroke='white'
        />
      );
    });
    let range = '';
    const marks = {};
    if (filter.expanded) {
      const min = isDate ? new Date(filter.range.min.value).toLocaleString().split(', ')[0] : filter.range.min.value;
      const max = isDate ? new Date(filter.range.max.value).toLocaleString().split(', ')[0] : filter.range.max.value;
      range = min !== undefined ? (<div>range: [{min} — {max}]</div>) : '';
      const markStyle = {fontSize: '8px', display: 'inline-block'};
      marks[this.xscale(filter.range.min.index)] = { label: <div style={markStyle}>{min}</div> };
      marks[this.xscale(filter.range.max.index + 1)] = { label: <div style={markStyle}>{max}</div> };
    }
    const info = filter.expanded ? (
        <div>
          <span>{this.props.data.unit}</span>
          {range}
        </div>
      ) : (<div></div>);
    const style = { width: (this.props.width - (this.padding * 2)), margin: '0 16px' };
    const brush = filter.expanded ? (
        <div style={style}>
          <Range
            min={this.xscale(0)}
            max={this.xscale(this.props.data.values.length)}
            marks={marks}
            step={barWidth}
            allowCross={false}
            value={[this.xscale(filter.range.min.index), this.xscale(filter.range.max.index + 1)]}
            onChange={(values) => this.updateFilter(this.props.name, values)}
          />
        </div>
      ) : '';
    return (
      <div>
        <label>{this.props.name}</label>
        {info}
        <svg
          width={this.props.width}
          height={this.props.height}
          style={{
            margin: '0 16px',
            marginTop: '8px',
          }}
          onMouseOut={() => {document.addEventListener('mousemove', null)}}
        >
          {bars}
        </svg>
        {brush}
      </div>
    );
  }
};
