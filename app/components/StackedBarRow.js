import React, { Component } from 'react';

import _sortBy from 'lodash.sortby';
import _cloneDeep from 'lodash.clonedeep';

import StackedBar from './StackedBar';
import Modal from './Modal';

import styles from './StackedBarRow.css';
import gstyle from './general.css';

export default class StackedBarRow extends Component {
  constructor(props) {
    super(props);
    
    this.state = {
      hovered: false,
      showTags: false,
    };

    this.hoverHandle = null;
  }

  componentWillUnmount() {
    if (this.hoverHandle) {
      clearTimeout(this.hoverHandle);
    }
  }

  _showEditable = (event) => {
    if (!this.state.hovered) {
      this.hoverHandle = setTimeout(() => {
        this.setState({hovered: true});
      }, 500);
    }
  }

  _hideEditable = () => {
    if (this.hoverHandle) {
      clearTimeout(this.hoverHandle);
    }
    if (this.state.hovered) {
      this.setState({ hovered: false, showTags: false });
    }
  }

  _toggleTagMenu = () => {
    const showTags = !this.state.showTags;
    this.setState({ showTags });
  }

  render() {
    const sequence = _sortBy(_cloneDeep(this.props.data.sequences), (s) => -s.reads);
    const className = (this.props.index%2 === 0) ? styles.white : gstyle.grey;
    const miniBars = [];
    let miniBarIndex = 0;
    const miniBarCount = Object.keys(this.props.filters).length;
    Object.keys(this.props.filters).forEach(k => {
      const [miniSequence] = _cloneDeep(sequence).filter(s => (s.name === k));
      if (miniSequence) {
        miniBars.push(
          <g
            key={k}
            id={k}
            height={this.props.metrics.miniBarContainerHeight}
            transform={`translate(0, ${
              (this.props.metrics.barHeight + 2) + 
              this.props.metrics.miniBarContainerHeight * miniBarIndex
            })`}
          >
            <StackedBar
              data={[miniSequence]}
              sample={this.props.data}
              width={this.props.metrics.chartWidth}
              height={(this.props.metrics.miniBarHeight)}
              xscale={this.props.scales.x}
              cscale={this.props.scales.c}
              isPercent={false}
              renderSVG={this.props.renderSVG}
            />
          </g>
        );
        miniBarIndex++;
      }
    });
    const edit = (this.state.hovered && (this.props.labelKey === 'phinchName')) ? (
        <div
          className={styles.button}
          style={{
            position: 'absolute',
            pointerEvents: 'none',
            top: 0,
            right: 0,
          }}
        >edit</div>
      ) : '';
    const name = (this.state.hovered && (this.props.labelKey === 'phinchName')) ? (
        <div
          className={`${styles.rowLabel} ${styles.input}`}
          style={{
            position: 'absolute',
            width: this.props.metrics.nameWidth,
            left: this.props.metrics.idWidth + (this.props.metrics.padding / 2),
          }}
        >
          <input
            className={`${gstyle.input} `}
            type="text"
            value={this.props.data[this.props.labelKey]}
            ref={i => this._input = i}
            onChange={(e) => this.props.updatePhinchName(e, this.props.data, this.props.isRemoved)}
            onKeyDown={(e) => (e.key === 'Enter') ? this._input.blur() : null}
          />
          {edit}
        </div>
      ) : '';
    const samples = (this.state.hovered && this.props.isAttribute) ? (
        <Modal
          buttonTitle={'Samples'}
          modalTitle={`${this.props.data[this.props.labelKey]} ${this.props.unit}`}
          buttonPosition={{
            position: 'relative',
            marginTop: this.props.metrics.padding,
            marginLeft: this.props.metrics.idWidth + (this.props.metrics.padding / 2),
            height: '12px',
            lineHeight: '9px',
            fontSize: '9px',
            padding: '1px 8px',
            width: 'auto',
            borderRadius: '6px',
            backgroundColor: '#b2b2b2',
          }}
          modalPosition={{
            position: 'absolute',
            marginTop: this.props.metrics.padding,
            marginLeft: this.props.metrics.idWidth + (this.props.metrics.nameWidth / 2),
            width: '316px',
            height: '216px',
            color: 'white',
          }}
          data={
            this.props.data.sampleObjects.map((s, i) => {
              return (
                <div
                  key={s.phinchName}
                  className={styles.sampleRow}
                  style={{backgroundColor: (i%2 === 0) ? '#121212' : '#000000'}}
                >
                  <div className={`${this.props.styles.cell} ${this.props.styles.name} ${styles.name}`}>
                    {s.phinchName}
                  </div>
                  <div className={this.props.styles.cell}>
                    {
                      Object.keys(s.tags).map(t => {
                        return (
                          <div
                            key={t}
                            className={`${this.props.styles.circle} ${styles.circle}`}
                            style={{background: s.tags[t].color}}
                          />
                        )
                      })
                    }
                  </div>
                  <div className={`${this.props.styles.cell} ${this.props.styles.reads} ${styles.reads}`}>
                    {s.reads.toLocaleString()}
                  </div>
                </div>
              )
            })
          }
          badge={false}
        />
      ) : '';
    const ellipsis = (this.state.hovered && (this.props.isAttribute !== true)) ? (
        <div
          className={styles.button}
          style={{
            marginTop: this.props.metrics.lineHeight * 2 + 1,
            marginLeft: this.props.metrics.padding / 4,
            paddingLeft: '6px',
            lineHeight: '7px',
            fontWeight: 800,
            letterSpacing: '2px',
          }}
          onClick={this._toggleTagMenu}
        >
        ...
        </div>
      ) : '';
    const tagMenu = this.state.showTags ? (
        <div className={styles.tagMenu}>
          {
            this.props.tags.map(t => {
              const selected = this.props.data.tags[t.id] ? true : false;
              return (
                <div
                  key={`t-${t.color}`}
                  className={`${styles.tag} ${selected ? styles.selected : ''}`}
                  onClick={() => this.props.toggleTag(this.props.data, t)}
                >
                  <div
                    className={`${gstyle.circle} ${styles.tagIcon}`}
                    style={{ background: t.color }}
                  >
                    {selected ? '-' : '+'}
                  </div>
                  <span className={styles.tagLabel}>
                    {t.name}
                  </span>
                </div>
              );
            })
          }
        </div>
      ) : '';
    let xOffset = 0;
    const tagList = (
      <g id='tags' transform={`translate(
        ${this.props.metrics.idWidth + this.props.metrics.padding - 1},
        ${this.props.metrics.lineHeight * 2.5 + 1}
      )`}>
        {
          this.props.tags.map(t => {
            const circle = this.props.data.tags[t.id] ? (
              <circle
                key={`c-${t.id}`}
                id={t.name}
                transform={`translate(${xOffset}, 0)`}
                fill={t.color}
                stroke='none'
                r='6'
              />
            ) : '';
            const offset = this.props.data.tags[t.id] ? (this.props.metrics.padding) : 0;
            xOffset += offset;
            return circle;
          })
        }
      </g>
      );
    const action = (this.state.hovered && (this.props.isAttribute !== true)) ? (
        <div
          className={styles.button}
          style={{
            position: 'absolute',
            right: 0,
            marginTop: this.props.metrics.lineHeight * 2 + 1,
          }}
          onClick={
            this.props.isRemoved ? this.props.restoreDatum : this.props.removeDatum
          }
        >
          {this.props.isRemoved ? 'Restore' : 'Archive'}
        </div>
      ) : '';
    const yOffset = this.props.metrics.padding + (this.props.metrics.barContainerHeight + (this.props.metrics.miniBarContainerHeight * miniBarCount)) * this.props.index;
    const rowColor = (this.props.index%2 === 0) ? '#ffffff' : '#f4f4f4';
    return (
      <g
        key={this.props.data.sampleName}
        id={this.props.data.sampleName}
        height={this.props.metrics.barContainerHeight + (this.props.metrics.miniBarContainerHeight * miniBarCount)}
        transform={`translate(1, ${yOffset})`}
        onMouseEnter={this._showEditable}
        onMouseLeave={this._hideEditable}
      >
        <rect
          fill={rowColor}
          stroke={rowColor}
          strokeWidth={2}
          className={styles.row}
          transform={`translate(0, -4)`}
          rx={this.props.metrics.padding / 2}
          ry={this.props.metrics.padding / 2}
          width={this.props.metrics.nonbarWidth + this.props.metrics.chartWidth - ((this.props.metrics.padding * 2) + 4)}
          height={this.props.metrics.barContainerHeight + (this.props.metrics.miniBarContainerHeight * miniBarCount) - 4}
        />
        <g
          id='Row Info'
          width={this.props.metrics.barInfoWidth}
          height={this.props.metrics.barHeight}
        >
          <text id='biomid' transform={`translate(
            ${(this.props.metrics.padding / 2) - 4},
            ${(this.props.metrics.lineHeight * 1) - 3}
          )`}>
            {(this.props.data.biomid !== undefined) ? this.props.data.biomid.toLocaleString() : ''}
          </text>
          <text
            id='name'
            fontWeight={400}
            transform={`translate(
              ${this.props.metrics.idWidth + this.props.metrics.padding / 2},
              ${(this.props.metrics.lineHeight * 1) - 3}
            )`}
          >
            {
              (this.state.hovered && (this.props.labelKey === 'phinchName')) ? (
                ''
              ) : this.props.data[this.props.labelKey]
            }
          </text>
          <g transform={`translate(
            ${this.props.metrics.idWidth + this.props.metrics.padding / 2},
            ${(this.props.metrics.lineHeight * 2) - 3}
          )`}>
            <text id='date'>
              {this.props.data.date ? this.props.data.date : ''}
            </text>
          </g>
          {tagList}
          <foreignObject>
            <div style={{
              position: 'fixed',
              width: this.props.metrics.barInfoWidth - (this.props.metrics.padding / 2),
              zIndex: 3,
            }}>
              {name}
              {samples}
              {ellipsis}
              {tagMenu}
              {action}
            </div>
          </foreignObject>
        </g>
        <g id='Bars' transform={`translate(${this.props.metrics.barInfoWidth - 2}, 0)`}>
          <StackedBar
            onHoverDatum={this.props.hoverDatum}
            onClickDatum={this.props.clickDatum}
            data={sequence}
            sample={this.props.data}
            width={this.props.metrics.chartWidth}
            height={this.props.metrics.barHeight}
            xscale={this.props.scales.x}
            cscale={this.props.scales.c}
            isPercent={this.props.isPercent}
            highlightedDatum={this.props.highlightedDatum}
            renderSVG={this.props.renderSVG}
          />
          {miniBars}
        </g>
      </g>
    );
  }
}