import * as React from "react";
import * as ReactDOM from "react-dom";

interface IProps {
  department: string;
  onChange: (department: string) => void;
}

// render a textbox for inputing course number, or show course info if already selected
export default class Departments extends React.PureComponent<IProps, {}> {
  public render() {
    return (
      <div>
        <label htmlFor="department">Your Department:</label>
        <select
          className="form-control"
          id="department"
          value={this.props.department}
          onChange={e => this.props.onChange(e.target.value)}
        >
          <option value='AARE'>Agricultural & Resource Economics</option>
          <option value='AANS'>Animal Science</option>
          <option value='ABAE'>Biological & Agricultural Engineering</option>
          <option value='ADNO'>CAES Deans Office</option>
          <option value='AENM'>Entomology & Nematology</option>
          <option value='ADES'>Environmental Science & Policy</option>
          <option value='AETX'>Environmental Toxicology</option>
          <option value='BEVE'>Evolution & Ecology</option>
          <option value='AFST'>Food Science & Technology</option>
          <option value='AHCE'>Human Ecology</option>
          <option value='AIND'>Independent</option>
          <option value='ALAW'>Land, Air & Water Resources</option>
          <option value='BMIC'>Microbiology & Molecular Genetics</option>
          <option value='BMCB'>Molecular & Cellular Biology</option>
          <option value='BNPB'>Neurobiology, Physiology & Behavior</option>
          <option value='ANUT'>Nutrition</option>
          <option value='BPLB'>Plant Biology</option>
          <option value='APPA'>Plant Pathology</option>
          <option value='APLS'>Plant Sciences</option>
          <option value='ATXC'>Textiles & Clothing</option>
          <option value='AVIT'>Viticulture & Enology</option>
          <option value='AWFC'>Wildlife, Fish & Conservation Biology</option>
        </select>
      </div>
    );
  }
}
