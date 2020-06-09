import React from "react";
import { connect } from "react-redux";
import { State } from "renderer/store";

const oneDay = 1000 * 60 * 60 * 24;

type OwnProps = {
  className?: string;
  date: number;
};

type Props = OwnProps & ReturnType<typeof mapStateToProps>;

function TimeRemaining(props: Props) {
  if (Number.isNaN(props.date)) {
    return <div className={props.className + " bp3-skeleton"}>99 Days Remaining</div>;
  }

  const timeLeft = props.date - Date.now();
  const daysRemaining = Math.max(0, Math.floor(timeLeft / oneDay));

  if (daysRemaining > 1) {
    return <div className={props.className}>{daysRemaining} days remaining</div>;
  } else if (daysRemaining === 1) {
    return <div className={props.className}>1 day remaining</div>;
  } else if (timeLeft > 0) {
    return <div className={props.className}>Less than a day remaining</div>;
  } else {
    return <div className={props.className}>Expired</div>;
  }
}

function mapStateToProps(state: State) {
  return {
    isVisible: state.route.isVisible, // use to trigger a rerender
  };
}

export default connect(mapStateToProps)(TimeRemaining);
