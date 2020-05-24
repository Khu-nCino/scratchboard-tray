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
    return <div className={props.className + ' bp3-skeleton'}>99 Days Remaining</div>
  }

  const timeLeft = props.date - Date.now();
  const daysRemaining = Math.max(0, Math.floor(timeLeft / oneDay));
  const daysLabel = daysRemaining === 1 ? "Day" : "Days";

  return (
    <div className={props.className}>
      {daysRemaining} {daysLabel} Remaining
    </div>
  );
}

function mapStateToProps(state: State) {
  return {
    isVisible: state.route.isVisible, // use to trigger a rerender
  };
}

export default connect(mapStateToProps)(TimeRemaining);