import React from 'react';

import PercentageBarGraph from './PercentageBarGraph';

import styles from './StackedBarTooltip.css';

const percentFormatter = (value) => {
  return `${Math.round(value * 10000) / 100}%`
}

export default function StackedBarTooltip(props) {
  if (props.datum == null) {
    return null;
  }

  const size = {
    x: 332,
    y: 232,
  };
  const position = props.position;
  if (position.x + size.x > window.innerWidth) {
    position.x -= size.x;
  }
  if (position.y + size.y > window.innerHeight) {
    position.y -= size.y;
  }
  const style = {
    transform: `translate(${position.x}px, ${position.y}px)`
  };

  const samplePercent = props.datum.reads / props.sample.reads
  const totalPercentReads = props.datum.reads / props.totalDataReads

  return (
    <div style={style} className={styles.StackedBarTooltip}>
      <div className={styles.label}>Sample Name:</div>
      <div className={styles.value}>{props.sample.phinchName}</div>

      <div className={styles.label}>Taxonomy:</div>
      <div className={styles.value}>{props.datum.name}</div>

      <div className={styles.label}>Taxonomy Occurence in this sample</div>
      <div className={styles.value}>
        {percentFormatter(samplePercent)}
        <span className={styles.small}>
          {` ${props.datum.reads.toLocaleString()} out of ${props.sample.reads.toLocaleString()}`}
        </span>
        <PercentageBarGraph percent={samplePercent} width='300px' />
      </div>

      <div className={styles.label}>Out of Total Taxonomy Occurence in all samples</div>
      <div className={styles.value}>
        {percentFormatter(totalPercentReads)}
        <span className={styles.small}>
          {` ${props.datum.reads.toLocaleString()} out of ${props.totalDataReads.toLocaleString()}`}
        </span>
        <PercentageBarGraph percent={totalPercentReads} width='300px' />
      </div>
    </div>
  );
}
