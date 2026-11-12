// Shared monthly compute prices matching the Go backend RAM x CPU matrix.
export const MONTHLY_COMPUTE_PRICES=[
 [49,65,85,105,125,145,165,185],[65,99,115,135,155,175,195,215],
 [85,120,150,170,190,210,230,250],[110,185,200,220,240,260,280,300],
 [130,195,215,240,260,280,300,320],[150,220,240,270,290,310,330,350],
 [175,245,270,300,325,350,375,400],[200,275,300,350,375,400,450,500],
];
export const isRecommended=(ram,cpu)=>Number(ram)===8&&Number(cpu)===4;
export const computePrice=(ram,cpu)=>MONTHLY_COMPUTE_PRICES[Number(ram)-1]?.[Number(cpu)-1]??null;
