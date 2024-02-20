export const buildWmsCQLFilter = (v: any) => {
  let wmsCQLFilter = '';
  wmsCQLFilter = '';
  if (v.region) {
    if (wmsCQLFilter.length > 0) {
      wmsCQLFilter += '&&';
    }
    wmsCQLFilter += 'rgn=' + v.region;
  }
  if (v.district) {
    if (wmsCQLFilter.length > 0) {
      wmsCQLFilter += '&&';
    }
    wmsCQLFilter += 'dst=' + v.district;
  }
  if (v.conton) {
    if (wmsCQLFilter.length > 0) {
      wmsCQLFilter += '&&';
    }
    wmsCQLFilter += 'cntn=' + v.conton;
  }
  if (v.culture) {
    const val = v.culture;
    if (wmsCQLFilter.length > 0) {
      wmsCQLFilter += '&&';
    }
    if (typeof val === 'string' && val.split(',').length > 1) {
      wmsCQLFilter += `clt in (${val})`;
    } else {
      wmsCQLFilter += 'clt=' + v.culture;
    }
  }
  if (v.land_type) {
    const val = v.land_type;
    if (wmsCQLFilter.length > 0) {
      wmsCQLFilter += '&&';
    }
    if (typeof val === 'string' && val.split(',').length > 1) {
      wmsCQLFilter += `ltype in (${val})`;
    } else {
      wmsCQLFilter += 'ltype=' + v.land_type;
    }
  }
  if (v.year) {
    const val = v.year;
    if (wmsCQLFilter.length > 0) {
      wmsCQLFilter += '&&';
    }

    wmsCQLFilter += 'year=' + val;
  }
  return wmsCQLFilter;
};
